import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting to verify existing users...")

  // First, let's check all users
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      emailVerified: true,
    },
  })

  console.log(`Found ${allUsers.length} total users:`)
  allUsers.forEach((user) => {
    console.log(`  - ${user.email} (emailVerified: ${user.emailVerified})`)
  })

  // Count unverified users
  const unverifiedCount = allUsers.filter((u) => !u.emailVerified).length
  console.log(`\n${unverifiedCount} users need to be verified`)

  // Update all users where emailVerified is not true
  const result = await prisma.user.updateMany({
    where: {
      emailVerified: {
        not: true,
      },
    },
    data: {
      emailVerified: true,
    },
  })

  console.log(`✅ Successfully verified ${result.count} existing users`)
}

main()
  .catch((e) => {
    console.error("Error verifying existing users:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

