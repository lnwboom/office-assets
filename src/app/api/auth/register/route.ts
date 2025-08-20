import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User, { IUser } from '@/models/User';
import { Types } from 'mongoose';

export async function POST(request: Request) {
  try {
    // Connect to database
    try {
      await dbConnect();
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { message: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล' },
        { status: 500 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Request parsing error:', error);
      return NextResponse.json(
        { message: 'รูปแบบข้อมูลไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const { username, password, email, fullName, department } = body;

    // Validate required fields
    if (!username || !password || !email || !fullName || !department) {
      return NextResponse.json(
        { message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Database operations
    try {
      // Check if username already exists
      const existingUser = await User.findOne({ username: username.toLowerCase() }).exec();
      if (existingUser) {
        return NextResponse.json(
          { message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' },
          { status: 400 }
        );
      }

      // Check if email already exists
      const existingEmail = await User.findOne({ email: email.toLowerCase() }).exec();
      if (existingEmail) {
        return NextResponse.json(
          { message: 'อีเมลนี้มีอยู่ในระบบแล้ว' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      const user = await User.create({
        username: username.toLowerCase(),
        password: hashedPassword,
        email: email.toLowerCase(),
        fullName,
        department,
        role: 'USER',
        status: 'ACTIVE',
      });

      if (!user || !user._id) {
        throw new Error('User creation failed: User object is invalid');
      }

      const userDoc = user.toObject();

      // Remove password from response
      const userWithoutPassword = {
        id: userDoc._id.toString(),
        username: userDoc.username,
        email: userDoc.email,
        fullName: userDoc.fullName,
        department: userDoc.department,
        role: userDoc.role,
        status: userDoc.status,
      };

      return NextResponse.json({
        message: 'ลงทะเบียนสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ',
        user: userWithoutPassword,
      }, { status: 201 });

    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json(
        { message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        message: 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
