import { Redirect } from 'expo-router';

import { useSession } from '@/lib/session';

export default function Index() {
  const { booting, token } = useSession();
  if (booting) return null;
  return <Redirect href={token ? '/(drawer)/home' : '/(auth)/login'} />;
}

