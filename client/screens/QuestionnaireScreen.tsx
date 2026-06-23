import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Slider from "@react-native-community/slider";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { FamilyTreeInput } from "@/components/FamilyTreeInput";
import { useTheme } from "@/hooks/useTheme";
import { useAppState } from "@/hooks/useAppState";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { questions, questionCategories } from "@/data/questions";
import { culturesByContinent, continentLabels, CultureOption } from "@/data/cultures";
import {
  Question,
  QuestionnaireAnswers,
  FamilyTreeData,
  NameRecord,
} from "@/models/types";
import { generateDeckAI, generateDeck } from "@/services/RecommendationEngine";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Props = NativeStackScreenProps<RootStackParamList, "Questionnaire">;

export default function QuestionnaireScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { setAnswers, completeOnboarding, setDeck, buckets } = useAppState();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setLocalAnswers] = useState<QuestionnaireAnswers>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const visibleQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (!q.dependsOn) return true;
      const depValue = answers[q.dependsOn.questionId];

      if (q.dependsOn.hasAnyValue) {
        if (Array.isArray(depValue)) {
          return depValue.length > 0;
        }
        return !!depValue;
      }

      if (Array.isArray(q.dependsOn.value)) {
        return q.dependsOn.value.includes(depValue as string);
      }
      return depValue === q.dependsOn.value;
    });
  }, [answers]);

  const getDynamicCultureOptions = useMemo(() => {
    const selectedContinents = (answers.continents as string[]) || [];
    const cultureOptions: { continent: string; cultures: CultureOption[] }[] = [];

    for (const continent of selectedContinents) {
      if (culturesByContinent[continent]) {
        cultureOptions.push({
          continent,
          cultures: culturesByContinent[continent],
        });
      }
    }
    return cultureOptions;
  }, [answers.continents]);

  const currentQuestion = visibleQuestions[currentIndex];
  const progress = ((currentIndex + 1) / visibleQuestions.length) * 100;
  const isLastQuestion = currentIndex === visibleQuestions.length - 1;
  const canContinue = currentQuestion?.optional || !!answers[currentQuestion?.id];

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = useCallback(async () => {
    if (isLastQuestion) {
      setIsGenerating(true);
      try {
        setAnswers(answers);
        const allBucketIds = [...buckets.yes, ...buckets.maybe, ...buckets.no];

        // Try AI generation first, fall back to static
        const familyTree = answers.familyTree as FamilyTreeData | undefined;
        let deck: { record: NameRecord; score: number; reasons: string[] }[];

        try {
          const result = await generateDeckAI(answers, familyTree, allBucketIds, false, 0);
          deck = result.names.map((name, idx) => ({
            record: name,
            score: result.names.length - idx,
            reasons: name.why ? [name.why] : [],
          }));
        } catch {
          // Fallback to static engine
          deck = generateDeck(answers, allBucketIds, false, 0);
        }

        setDeck(deck);
        completeOnboarding();
        navigation.replace("Main");
      } finally {
        setIsGenerating(false);
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }, [isLastQuestion, answers, currentIndex, navigation, setAnswers, completeOnboarding, setDeck, buckets]);

  const updateAnswer = useCallback((value: string | string[] | number | boolean | FamilyTreeData) => {
    setLocalAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  }, [currentQuestion?.id]);

  const handleOptionSelect = useCallback((value: string) => {
    if (currentQuestion.type === "singleSelect") {
      updateAnswer(value);
    } else if (currentQuestion.type === "multiSelect" || currentQuestion.type === "dynamicMultiSelect") {
      const current = (answers[currentQuestion.id] as string[]) || [];
      if (current.includes(value)) {
        updateAnswer(current.filter((v) => v !== value));
      } else {
        updateAnswer([...current, value]);
      }
    }
  }, [currentQuestion, answers, updateAnswer]);

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "singleSelect":
        return (
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                selected={answers[currentQuestion.id] === option.value}
                onPress={() => handleOptionSelect(option.value)}
              />
            ))}
          </View>
        );

      case "multiSelect":
        const selectedValues = (answers[currentQuestion.id] as string[]) || [];
        return (
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                selected={selectedValues.includes(option.value)}
                onPress={() => handleOptionSelect(option.value)}
                multi
              />
            ))}
          </View>
        );

      case "slider":
        const sliderValue = (answers[currentQuestion.id] as number) || currentQuestion.minValue || 1;
        return (
          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabels}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {currentQuestion.minLabel}
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {currentQuestion.maxLabel}
              </ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={currentQuestion.minValue || 1}
              maximumValue={currentQuestion.maxValue || 5}
              step={1}
              value={sliderValue}
              onValueChange={(v) => updateAnswer(v)}
              minimumTrackTintColor={Colors.light.primary}
              maximumTrackTintColor={Colors.light.border}
              thumbTintColor={Colors.light.primary}
            />
            <View style={styles.sliderValueContainer}>
              <ThemedText type="h3" style={{ color: Colors.light.primary }}>
                {sliderValue}
              </ThemedText>
            </View>
          </View>
        );

      case "toggle":
        const toggleValue = answers[currentQuestion.id] as boolean || false;
        return (
          <View style={styles.toggleContainer}>
            <Switch
              value={toggleValue}
              onValueChange={(v) => updateAnswer(v)}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor={Colors.light.surface}
            />
            <ThemedText type="body" style={[styles.toggleLabel, { color: theme.textSecondary }]}>
              {toggleValue ? "Yes, include gender-neutral names" : "No, only match selected gender"}
            </ThemedText>
          </View>
        );

      case "text":
        const textValue = (answers[currentQuestion.id] as string) || "";
        return (
          <View style={styles.textInputContainer}>
            <TextInput
              style={[styles.textInput, { color: theme.text, borderColor: theme.border }]}
              value={textValue}
              onChangeText={updateAnswer}
              placeholder={currentQuestion.placeholder || "Type here..."}
              placeholderTextColor={theme.textTertiary}
              maxLength={currentQuestion.maxLength || 100}
              returnKeyType="done"
            />
          </View>
        );

      case "textarea":
        const textareaValue = (answers[currentQuestion.id] as string) || "";
        return (
          <View style={styles.textInputContainer}>
            <TextInput
              style={[styles.textareaInput, { color: theme.text, borderColor: theme.border }]}
              value={textareaValue}
              onChangeText={updateAnswer}
              placeholder={currentQuestion.placeholder || "Type here..."}
              placeholderTextColor={theme.textTertiary}
              maxLength={currentQuestion.maxLength || 500}
              multiline
              textAlignVertical="top"
              blurOnSubmit
            />
            {currentQuestion.maxLength ? (
              <ThemedText type="caption" style={[styles.charCount, { color: theme.textTertiary }]}>
                {textareaValue.length}/{currentQuestion.maxLength}
              </ThemedText>
            ) : null}
          </View>
        );

      case "textList":
        const textListValue = (answers[currentQuestion.id] as string[]) || [];
        return (
          <TextListInput
            values={textListValue}
            onChange={(values) => updateAnswer(values)}
            placeholder={currentQuestion.placeholder || "Add item..."}
          />
        );

      case "familyTree":
        const treeValue = (answers[currentQuestion.id] as FamilyTreeData) || { members: [], ancestralSurnames: [], originNotes: "" };
        return (
          <FamilyTreeInput
            value={treeValue}
            onChange={(data) => updateAnswer(data)}
          />
        );

      case "dynamicMultiSelect":
        const dynamicSelectedValues = (answers[currentQuestion.id] as string[]) || [];
        return (
          <View style={styles.dynamicOptionsContainer}>
            {getDynamicCultureOptions.map(({ continent, cultures }) => (
              <View key={continent} style={styles.continentSection}>
                <ThemedText type="label" style={[styles.continentLabel, { color: theme.primary }]}>
                  {continentLabels[continent]}
                </ThemedText>
                <View style={styles.optionsContainer}>
                  {cultures.map((culture) => (
                    <OptionButton
                      key={culture.value}
                      label={culture.label}
                      selected={dynamicSelectedValues.includes(culture.value)}
                      onPress={() => handleOptionSelect(culture.value)}
                      multi
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  if (isGenerating) {
    return (
      <View style={[styles.container, styles.generatingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText type="h3" style={styles.generatingText}>
          Finding your perfect names...
        </ThemedText>
        <ThemedText type="body" style={[styles.generatingSubtext, { color: theme.textSecondary }]}>
          Our AI is crafting personalized suggestions just for you
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.headerRow}>
          {currentIndex > 0 ? (
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={theme.text} />
            </Pressable>
          ) : (
            <View style={styles.backButton} />
          )}
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {currentIndex + 1} of {visibleQuestions.length}
          </ThemedText>
          <View style={styles.backButton} />
        </View>
        <ProgressBar progress={progress} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="label" style={[styles.category, { color: Colors.light.primary }]}>
          {currentQuestion?.category}
        </ThemedText>
        <ThemedText type="h2" style={styles.question}>
          {currentQuestion?.question}
        </ThemedText>
        {currentQuestion?.subtitle ? (
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            {currentQuestion.subtitle}
          </ThemedText>
        ) : null}
        {currentQuestion?.optional ? (
          <ThemedText type="caption" style={[styles.optional, { color: theme.textTertiary }]}>
            Optional
          </ThemedText>
        ) : null}
        {renderQuestion()}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Button onPress={handleNext} disabled={!canContinue && !currentQuestion?.optional}>
          {isLastQuestion ? "Find My Names" : "Continue"}
        </Button>
        {currentQuestion?.optional && !answers[currentQuestion.id] ? (
          <Pressable onPress={handleNext} style={styles.skipButton}>
            <ThemedText type="body" style={{ color: Colors.light.primary }}>
              Skip this question
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  multi?: boolean;
}

function OptionButton({ label, selected, onPress, multi }: OptionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.optionButton,
        selected && styles.optionButtonSelected,
      ]}
    >
      <ThemedText
        type="body"
        style={[
          styles.optionText,
          selected && styles.optionTextSelected,
        ]}
      >
        {label}
      </ThemedText>
      {multi ? (
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected ? (
            <Feather name="check" size={14} color={Colors.light.buttonText} />
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

interface TextListInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}

function TextListInput({ values, onChange, placeholder }: TextListInputProps) {
  const [inputValue, setInputValue] = useState("");
  const { theme } = useTheme();

  const handleAdd = () => {
    if (inputValue.trim() && !values.includes(inputValue.trim())) {
      onChange([...values, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemove = (value: string) => {
    onChange(values.filter((v) => v !== value));
  };

  return (
    <View style={styles.textListContainer}>
      <View style={styles.textListInputRow}>
        <TextInput
          style={[styles.textListInput, { color: theme.text, borderColor: theme.border }]}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable onPress={handleAdd} style={styles.addButton}>
          <Feather name="plus" size={20} color={Colors.light.primary} />
        </Pressable>
      </View>
      <View style={styles.textListItems}>
        {values.map((value) => (
          <View key={value} style={styles.textListItem}>
            <ThemedText type="body" style={styles.textListItemText}>
              {value}
            </ThemedText>
            <Pressable onPress={() => handleRemove(value)}>
              <Feather name="x" size={16} color={Colors.light.textTertiary} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  generatingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  generatingText: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  generatingSubtext: {
    textAlign: "center",
  },
  header: {
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing["3xl"],
  },
  category: {
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  question: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  optional: {
    marginBottom: Spacing.lg,
  },
  optionsContainer: {
    marginTop: Spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  optionButtonSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}15`,
  },
  optionText: {
    color: Colors.light.text,
  },
  optionTextSelected: {
    color: Colors.light.primary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  checkboxSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  sliderContainer: {
    marginTop: Spacing.xl,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderValueContainer: {
    alignItems: "center",
    marginTop: Spacing.md,
  },
  toggleContainer: {
    marginTop: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
  },
  toggleLabel: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  textInputContainer: {
    marginTop: Spacing.xl,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
  },
  textareaInput: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 100,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
  },
  charCount: {
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  textListContainer: {
    marginTop: Spacing.xl,
  },
  textListInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  textListInput: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
  },
  addButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
    backgroundColor: `${Colors.light.primary}15`,
    borderRadius: BorderRadius.md,
  },
  textListItems: {
    marginTop: Spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  textListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.light.primary}15`,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  textListItemText: {
    color: Colors.light.primary,
    marginRight: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.lg,
  },
  skipButton: {
    alignItems: "center",
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dynamicOptionsContainer: {
    marginTop: Spacing.lg,
  },
  continentSection: {
    marginBottom: Spacing.xl,
  },
  continentLabel: {
    textTransform: "uppercase",
    marginBottom: Spacing.md,
    fontSize: 12,
    fontWeight: "600",
  },
});
