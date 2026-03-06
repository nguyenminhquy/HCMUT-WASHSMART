import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().optional().or(z.literal("")),
  password: z.string().min(8).max(72)
});

export async function POST(request: Request) {
  try {
    const payload = registerSchema.parse(await request.json());
    const normalizedEmail = payload.email?.trim().toLowerCase() || null;
    const passwordHash = await hash(payload.password, 10);

    const user = await prisma.customerUser.create({
      data: {
        name: payload.name,
        phone: payload.phone.trim(),
        email: normalizedEmail,
        passwordHash
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      }
    });

    return NextResponse.json({
      user
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Số điện thoại hoặc email đã được đăng ký."
        },
        { status: 409 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Dữ liệu đăng ký không hợp lệ."
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Không thể đăng ký tài khoản."
      },
      { status: 500 }
    );
  }
}
