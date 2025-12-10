import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyInitData } from "@/lib/telegramAuth";

type UserDoc = {
  _id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  allows_write_to_pm?: boolean;
  updatedAt: Date;
  createdAt: Date;
};

export async function POST(req: NextRequest) {
  try {
    const { initData } = (await req.json()) as { initData?: string };
    if (!initData) {
      return NextResponse.json({ error: "initData обязателен" }, { status: 400 });
    }

    const parsed = verifyInitData(initData);
    if (!parsed.user) {
      return NextResponse.json({ error: "user отсутствует в initData" }, { status: 400 });
    }

    const db = await getDb();
    const users = db.collection<UserDoc>("users");

    const now = new Date();
    const update: Partial<UserDoc> = {
      first_name: parsed.user.first_name,
      last_name: parsed.user.last_name,
      username: parsed.user.username,
      language_code: parsed.user.language_code,
      photo_url: parsed.user.photo_url,
      allows_write_to_pm: parsed.user.allows_write_to_pm,
      updatedAt: now,
    };

    const result = await users.findOneAndUpdate(
      { _id: parsed.user.id },
      {
        $set: update,
        $setOnInsert: { createdAt: now },
      },
      { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json({
      ok: true,
      user: {
        id: result?._id ?? parsed.user.id,
        firstName: update.first_name,
        lastName: update.last_name,
        username: update.username,
        photoUrl: update.photo_url,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

