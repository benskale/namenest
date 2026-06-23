import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AppState,
  QuestionnaireAnswers,
  Buckets,
  ScoredName,
  BucketType,
  UndoAction,
  DailyLimits,
} from "@/models/types";

const STORAGE_KEY = "@namenest_app_state";

// Dev mode: Set to true to always start fresh at Welcome screen for testing
const DEV_FORCE_ONBOARDING = __DEV__ && true;

const getInitialDailyLimits = (): DailyLimits => ({
  date: new Date().toISOString().split("T")[0],
  deckGenerations: 0,
  undoCount: 0,
  rewardedAdUsed: false,
});

const initialState: AppState = {
  hasCompletedOnboarding: false,
  answers: {},
  buckets: { yes: [], maybe: [], no: [] },
  currentDeck: [],
  currentDeckIndex: 0,
  undoStack: [],
  isPremium: false,
  dailyLimits: getInitialDailyLimits(),
  includeNeutralInSettings: true,
};

interface AppStateContextType extends AppState {
  isLoading: boolean;
  setAnswers: (answers: QuestionnaireAnswers) => void;
  completeOnboarding: () => void;
  setDeck: (deck: ScoredName[]) => void;
  nextCard: () => void;
  addToBucket: (bucket: BucketType, nameId: string) => void;
  removeFromBucket: (bucket: BucketType, nameId: string) => void;
  moveBetweenBuckets: (from: BucketType, to: BucketType, nameId: string) => void;
  pushUndo: (action: UndoAction) => void;
  popUndo: () => UndoAction | undefined;
  incrementDeckGeneration: () => boolean;
  canGenerateDeck: () => boolean;
  canUndo: () => boolean;
  useRewardedAd: () => void;
  hasUsedRewardedAd: () => boolean;
  setPremium: (isPremium: boolean) => void;
  resetAllData: () => void;
  setIncludeNeutral: (include: boolean) => void;
  getCurrentCard: () => ScoredName | undefined;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      // In dev mode, always clear onboarding to start fresh for testing
      if (DEV_FORCE_ONBOARDING) {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setIsLoading(false);
        return;
      }

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppState;
        const today = new Date().toISOString().split("T")[0];
        if (parsed.dailyLimits.date !== today) {
          parsed.dailyLimits = getInitialDailyLimits();
        }
        setState(parsed);
      }
    } catch (error) {
      console.error("Failed to load state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = async (newState: AppState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Failed to save state:", error);
    }
  };

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState((prev) => {
      const newState = { ...prev, ...updates };
      saveState(newState);
      return newState;
    });
  }, []);

  const setAnswers = useCallback((answers: QuestionnaireAnswers) => {
    updateState({ answers });
  }, [updateState]);

  const completeOnboarding = useCallback(() => {
    updateState({ hasCompletedOnboarding: true });
  }, [updateState]);

  const setDeck = useCallback((deck: ScoredName[]) => {
    updateState({ currentDeck: deck, currentDeckIndex: 0, undoStack: [] });
  }, [updateState]);

  const nextCard = useCallback(() => {
    setState((prev) => {
      const newState = { ...prev, currentDeckIndex: prev.currentDeckIndex + 1 };
      saveState(newState);
      return newState;
    });
  }, []);

  const addToBucket = useCallback((bucket: BucketType, nameId: string) => {
    setState((prev) => {
      const newBuckets = { ...prev.buckets };
      if (!newBuckets[bucket].includes(nameId)) {
        newBuckets[bucket] = [...newBuckets[bucket], nameId];
      }
      const newState = { ...prev, buckets: newBuckets };
      saveState(newState);
      return newState;
    });
  }, []);

  const removeFromBucket = useCallback((bucket: BucketType, nameId: string) => {
    setState((prev) => {
      const newBuckets = { ...prev.buckets };
      newBuckets[bucket] = newBuckets[bucket].filter((id) => id !== nameId);
      const newState = { ...prev, buckets: newBuckets };
      saveState(newState);
      return newState;
    });
  }, []);

  const moveBetweenBuckets = useCallback((from: BucketType, to: BucketType, nameId: string) => {
    setState((prev) => {
      const newBuckets = { ...prev.buckets };
      newBuckets[from] = newBuckets[from].filter((id) => id !== nameId);
      if (!newBuckets[to].includes(nameId)) {
        newBuckets[to] = [...newBuckets[to], nameId];
      }
      const newState = { ...prev, buckets: newBuckets };
      saveState(newState);
      return newState;
    });
  }, []);

  const pushUndo = useCallback((action: UndoAction) => {
    setState((prev) => {
      const newStack = [...prev.undoStack, action].slice(-10);
      const newState = { ...prev, undoStack: newStack };
      saveState(newState);
      return newState;
    });
  }, []);

  const popUndo = useCallback(() => {
    let poppedAction: UndoAction | undefined;
    setState((prev) => {
      if (prev.undoStack.length === 0) return prev;
      const newStack = [...prev.undoStack];
      poppedAction = newStack.pop();
      const newLimits = { ...prev.dailyLimits, undoCount: prev.dailyLimits.undoCount + 1 };
      const newState = { ...prev, undoStack: newStack, dailyLimits: newLimits };
      saveState(newState);
      return newState;
    });
    return poppedAction;
  }, []);

  const canUndo = useCallback(() => {
    if (state.undoStack.length === 0) return false;
    if (state.isPremium) return true;
    return state.dailyLimits.undoCount < 3;
  }, [state.undoStack.length, state.isPremium, state.dailyLimits.undoCount]);

  const canGenerateDeck = useCallback(() => {
    if (state.isPremium) return true;
    return state.dailyLimits.deckGenerations < 3;
  }, [state.isPremium, state.dailyLimits.deckGenerations]);

  const incrementDeckGeneration = useCallback(() => {
    if (!canGenerateDeck()) return false;
    setState((prev) => {
      const newLimits = {
        ...prev.dailyLimits,
        deckGenerations: prev.dailyLimits.deckGenerations + 1,
      };
      const newState = { ...prev, dailyLimits: newLimits };
      saveState(newState);
      return newState;
    });
    return true;
  }, [canGenerateDeck]);

  const useRewardedAd = useCallback(() => {
    setState((prev) => {
      const newLimits = { ...prev.dailyLimits, rewardedAdUsed: true };
      const newState = { ...prev, dailyLimits: newLimits };
      saveState(newState);
      return newState;
    });
  }, []);

  const hasUsedRewardedAd = useCallback(() => {
    return state.dailyLimits.rewardedAdUsed;
  }, [state.dailyLimits.rewardedAdUsed]);

  const setPremium = useCallback((isPremium: boolean) => {
    updateState({ isPremium });
  }, [updateState]);

  const resetAllData = useCallback(() => {
    const freshState = {
      ...initialState,
      dailyLimits: getInitialDailyLimits(),
    };
    setState(freshState);
    saveState(freshState);
  }, []);

  const setIncludeNeutral = useCallback((include: boolean) => {
    updateState({ includeNeutralInSettings: include });
  }, [updateState]);

  const getCurrentCard = useCallback(() => {
    if (state.currentDeckIndex >= state.currentDeck.length) return undefined;
    return state.currentDeck[state.currentDeckIndex];
  }, [state.currentDeck, state.currentDeckIndex]);

  return (
    <AppStateContext.Provider
      value={{
        ...state,
        isLoading,
        setAnswers,
        completeOnboarding,
        setDeck,
        nextCard,
        addToBucket,
        removeFromBucket,
        moveBetweenBuckets,
        pushUndo,
        popUndo,
        canUndo,
        incrementDeckGeneration,
        canGenerateDeck,
        useRewardedAd,
        hasUsedRewardedAd,
        setPremium,
        resetAllData,
        setIncludeNeutral,
        getCurrentCard,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
