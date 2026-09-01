import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import HomePage from "@/components/HomePage";
import { redirect } from 'next/navigation';

async function HomeSever() {
  const session = await auth();
  if (!session) {
    redirect('/signin');
  }

  const db = await getDb();

  const categoriesRaw = await db.collection('category').find({}).toArray();
  const categories = JSON.parse(JSON.stringify(categoriesRaw));

  const policiesRaw = await db.collection('policy').find({}).toArray();
  const policies = JSON.parse(JSON.stringify(policiesRaw));

  let events = [];
  try {
    const eventsRaw = await db.collection('event').find({}).toArray();
    events = JSON.parse(JSON.stringify(eventsRaw));
  } catch (err) {
    events = [];
  }

  return (
    <HomePage
      user={session?.user}
      categories={categories}
      policies={policies}
      events={events}
    />
  );
}


export default HomeSever;