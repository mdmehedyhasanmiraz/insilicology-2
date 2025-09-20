'use server';

export async function testServerAction(data: Record<string, unknown>) {
  console.log('Test server action called with:', data);
  return { success: true, message: 'Test action worked!' };
} 