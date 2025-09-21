import { Redirect } from 'expo-router';
import React from 'react';

// This component will be the first thing that loads.
// It immediately redirects the user to the login screen.
export default function Index() {
  return <Redirect href="/login" />;
}