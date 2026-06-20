"use server";

import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SavedRepo } from "@/lib/types";
import { normalizeTag } from "@/lib/utils/tags";

// All saved-repo mutations live here as Server Actions. Each returns the full
// authoritative SavedState so the client provider can reconcile after its
// optimistic update — the per-user dataset is small, so this is cheap and
// avoids hand-rolled cache merging.

export type SavedState = {
  saved: SavedRepo[];
  folders: string[];
};

const githubId = z.string().min(1).max(200);
const nameWithOwner = z.string().min(1).max(300);
const tagName = z.string().min(1).max(100);
const folderName = z.string().min(1).max(100);

const requireUserId = async (): Promise<string> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");
  // A JWT can outlive its User row (e.g. the dev DB was reset). Verify the row
  // still exists so a write fails with a clear signal rather than a raw foreign
  // key violation — the client treats this as a stale session and re-auths.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!user) throw new Error("Session is no longer valid. Please sign in again.");
  return session.user.id;
};

// Single source of truth for the client-facing shape
const loadState = async (userId: string): Promise<SavedState> => {
  const [repos, folders] = await Promise.all([
    prisma.savedRepo.findMany({
      where: { userId },
      orderBy: { savedAt: "desc" },
      include: {
        folder: { select: { name: true } },
        tags: { include: { tag: { select: { name: true } } } },
      },
    }),
    prisma.folder.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { name: true },
    }),
  ]);

  return {
    saved: repos.map((repo) => ({
      id: repo.githubId, // client keys repos by GitHub node id, as before
      nameWithOwner: repo.nameWithOwner,
      savedAt: repo.savedAt.toISOString(),
      tags: repo.tags.map((t) => t.tag.name),
      folder: repo.folder?.name ?? null,
    })),
    folders: folders.map((f) => f.name),
  };
};

// Read path is tolerant: a stale JWT (user row gone) resolves to empty state
// with a `staleSession` flag instead of throwing, so the client can sign out
// and re-auth gracefully on load rather than crash.
export const getSavedState = async (): Promise<
  SavedState & { staleSession?: boolean }
> => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { saved: [], folders: [] };
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) return { saved: [], folders: [], staleSession: true };
  return loadState(userId);
};

export const toggleSaveRepo = async (input: {
  githubId: string;
  nameWithOwner: string;
}): Promise<SavedState> => {
  const userId = await requireUserId();
  const id = githubId.parse(input.githubId);
  const name = nameWithOwner.parse(input.nameWithOwner);

  const existing = await prisma.savedRepo.findUnique({
    where: { userId_githubId: { userId, githubId: id } },
    select: { id: true },
  });

  if (existing) {
    await prisma.savedRepo.delete({ where: { id: existing.id } }); // tag joins cascade
  } else {
    await prisma.savedRepo.create({
      data: { userId, githubId: id, nameWithOwner: name },
    });
  }

  return loadState(userId);
};

export const addRepoTag = async (input: {
  githubId: string;
  tag: string;
}): Promise<SavedState> => {
  const userId = await requireUserId();
  const id = githubId.parse(input.githubId);
  const name = normalizeTag(tagName.parse(input.tag));
  if (!name) return loadState(userId);

  const repo = await prisma.savedRepo.findUnique({
    where: { userId_githubId: { userId, githubId: id } },
    select: { id: true },
  });
  if (!repo) return loadState(userId);

  const tag = await prisma.tag.upsert({
    where: { userId_name: { userId, name } },
    create: { userId, name },
    update: {},
  });
  await prisma.savedRepoTag.upsert({
    where: { savedRepoId_tagId: { savedRepoId: repo.id, tagId: tag.id } },
    create: { savedRepoId: repo.id, tagId: tag.id },
    update: {},
  });

  return loadState(userId);
};

export const removeRepoTag = async (input: {
  githubId: string;
  tag: string;
}): Promise<SavedState> => {
  const userId = await requireUserId();
  const id = githubId.parse(input.githubId);
  const name = normalizeTag(tagName.parse(input.tag));

  const repo = await prisma.savedRepo.findUnique({
    where: { userId_githubId: { userId, githubId: id } },
    select: { id: true },
  });
  const tag = await prisma.tag.findUnique({
    where: { userId_name: { userId, name } },
    select: { id: true },
  });
  if (!repo || !tag) return loadState(userId);

  await prisma.savedRepoTag.deleteMany({
    where: { savedRepoId: repo.id, tagId: tag.id },
  });

  // Prune the tag once nothing references it (keeps allTags = tags in use)
  const remaining = await prisma.savedRepoTag.count({ where: { tagId: tag.id } });
  if (remaining === 0) await prisma.tag.delete({ where: { id: tag.id } });

  return loadState(userId);
};

export const createFolder = async (input: {
  name: string;
}): Promise<SavedState> => {
  const userId = await requireUserId();
  const name = folderName.parse(input.name).trim();
  if (!name) return loadState(userId);

  // Case-insensitive dedupe to match the previous client behavior
  const existing = await prisma.folder.findFirst({
    where: { userId, name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (!existing) await prisma.folder.create({ data: { userId, name } });

  return loadState(userId);
};

export const renameFolder = async (input: {
  from: string;
  to: string;
}): Promise<SavedState> => {
  const userId = await requireUserId();
  const from = folderName.parse(input.from);
  const to = folderName.parse(input.to).trim();
  if (!to || to === from) return loadState(userId);

  const collision = await prisma.folder.findFirst({
    where: {
      userId,
      name: { equals: to, mode: "insensitive" },
      NOT: { name: from },
    },
    select: { id: true },
  });
  if (collision) return loadState(userId);

  await prisma.folder.updateMany({
    where: { userId, name: from },
    data: { name: to },
  });

  return loadState(userId);
};

export const deleteFolder = async (input: {
  name: string;
}): Promise<SavedState> => {
  const userId = await requireUserId();
  const name = folderName.parse(input.name);
  // Repos in the folder are unfiled via onDelete: SetNull — never unsaved
  await prisma.folder.deleteMany({ where: { userId, name } });
  return loadState(userId);
};

export const setRepoFolder = async (input: {
  githubId: string;
  folder: string | null;
}): Promise<SavedState> => {
  const userId = await requireUserId();
  const id = githubId.parse(input.githubId);
  const target = input.folder === null ? null : folderName.parse(input.folder);

  let folderId: string | null = null;
  if (target) {
    const folder = await prisma.folder.findFirst({
      where: { userId, name: target },
      select: { id: true },
    });
    folderId = folder?.id ?? null;
  }

  await prisma.savedRepo.updateMany({
    where: { userId, githubId: id },
    data: { folderId },
  });

  return loadState(userId);
};
