import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DeckScreen from "@/screens/DeckScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type DeckStackParamList = {
  Deck: undefined;
};

const Stack = createNativeStackNavigator<DeckStackParamList>();

export default function DeckStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Deck"
        component={DeckScreen}
        options={{
          headerTitle: () => <HeaderTitle title="NameNest" />,
        }}
      />
    </Stack.Navigator>
  );
}
