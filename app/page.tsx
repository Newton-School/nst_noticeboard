import { auth } from "@/auth"
import { getDb } from "@/lib/db";
import HomePage from "@/components/HomePage";
import { redirect } from 'next/navigation';

async function HomeSever() {

  const session = await auth();
  if(!session || session.user.role !== "admin"){
    redirect('/signin')
  }

  const db = await getDb();

  const categoriesRaw = await db.collection('category').find({}).toArray();
  const categories = JSON.parse(JSON.stringify(categoriesRaw));

  const policiesRaw = await db.collection('policy').find({}).toArray();
  const rawPolicies = JSON.parse(JSON.stringify(policiesRaw));

  return (
    <HomePage categories={categories} rawPolicies={rawPolicies}/>
  )
}

export default HomeSever;