import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import WelcomeScreen from "@/screens/WelcomeScreen";
import QuestionnaireScreen from "@/screens/QuestionnaireScreen";
import NameDetailScreen from "@/screens/NameDetailScreen";
import PaywallScreen from "@/screens/PaywallScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAppState } from "@/hooks/useAppState";
import { ScoredName } from "@/models/types";

export type RootStackParamList = {
  Welcome: undefined;
  Questionnaire: undefined;
  Main: undefined;
  NameDetail: { scoredName: ScoredName; fromBucket?: boolean };
  Paywall: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { hasCompletedOnboarding, isLoading } = useAppState();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!hasCompletedOnboarding ? (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Questionnaire"
            component={QuestionnaireScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : null}
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NameDetail"
        component={NameDetailScreen}
        options={{
          presentation: "modal",
          headerTitle: "Name Details",
        }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          presentation: "modal",
          headerTitle: "Unlock Premium",
        }}
      />
    </Stack.Navigator>
  );
}
