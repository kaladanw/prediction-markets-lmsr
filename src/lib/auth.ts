import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user: authUser }, error } = await supabase.auth.getUser()
  
  if (error || !authUser) {
    return null
  }

  // Find or create user in Prisma database
  let user = await prisma.user.findUnique({
    where: { id: authUser.id }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email!,
        balance: 100000
      }
    })
  }

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}