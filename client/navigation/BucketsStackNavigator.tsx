import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BucketsScreen from "@/screens/BucketsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type BucketsStackParamList = {
  Buckets: undefined;
};

const Stack = createNativeStackNavigator<BucketsStackParamList>();

export default function BucketsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Buckets"
        component={BucketsScreen}
        options={{
          headerTitle: "Saved Names",
        }}
      />
    </Stack.Navigator>
  );
}
