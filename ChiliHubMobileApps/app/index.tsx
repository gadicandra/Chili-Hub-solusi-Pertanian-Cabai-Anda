import { Redirect } from 'expo-router';

export default function Index() {
    // Redirect to auth or main based on the root layout logic
    return <Redirect href="/(auth)/login" />;
}
