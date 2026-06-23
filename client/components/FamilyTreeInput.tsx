import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import type { FamilyTreeData, FamilyMember } from "@/models/types";

interface Props {
  value: FamilyTreeData;
  onChange: (data: FamilyTreeData) => void;
}

const RELATIONS = [
  "Grandmother (paternal)",
  "Grandfather (paternal)",
  "Grandmother (maternal)",
  "Grandfather (maternal)",
  "Mother",
  "Father",
  "Aunt",
  "Uncle",
  "Great-grandparent",
  "Other relative",
];

export function FamilyTreeInput({ value, onChange }: Props) {
  const { theme: colors } = useTheme();
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState(RELATIONS[0]);
  const [showAncestral, setShowAncestral] = useState(false);
  const [newSurname, setNewSurname] = useState("");
  const [originNotes, setOriginNotes] = useState(value.originNotes || "");

  const addMember = () => {
    if (!newName.trim()) return;
    const side = newRelation.includes("paternal")
      ? "paternal"
      : newRelation.includes("maternal")
        ? "maternal"
        : undefined;

    const relation = newRelation.replace(/\s*\(.*?\)/g, "").trim();

    const member: FamilyMember = {
      name: newName.trim(),
      relation,
      side,
    };

    onChange({
      ...value,
      members: [...value.members, member],
    });
    setNewName("");
  };

  const removeMember = (idx: number) => {
    onChange({
      ...value,
      members: value.members.filter((_, i) => i !== idx),
    });
  };

  const addSurname = () => {
    if (!newSurname.trim()) return;
    onChange({
      ...value,
      ancestralSurnames: [...value.ancestralSurnames, newSurname.trim()],
    });
    setNewSurname("");
  };

  const removeSurname = (idx: number) => {
    onChange({
      ...value,
      ancestralSurnames: value.ancestralSurnames.filter((_, i) => i !== idx),
    });
  };

  return (
    <View style={styles.container}>
      {/* Family Members List */}
      {value.members.length > 0 && (
        <View style={styles.listSection}>
          {value.members.map((m, idx) => (
            <View key={idx} style={[styles.memberRow, { backgroundColor: colors.surface }]}>
              <View style={styles.memberInfo}>
                <ThemedText style={styles.memberName}>{m.name}</ThemedText>
                <ThemedText style={[styles.memberRelation, { color: colors.textSecondary }]}>
                  {m.relation}{m.side ? ` (${m.side})` : ""}
                </ThemedText>
              </View>
              <Pressable onPress={() => removeMember(idx)} style={styles.removeBtn}>
                <Feather name="x" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Add Member */}
      <View style={[styles.addSection, { borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Family member's name"
          placeholderTextColor={colors.textSecondary}
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={addMember}
        />
        <View style={styles.relationPicker}>
          {RELATIONS.map((r) => (
            <Pressable
              key={r}
              onPress={() => setNewRelation(r)}
              style={[
                styles.relationChip,
                {
                  backgroundColor: newRelation === r ? colors.primary : colors.surface,
                  borderColor: newRelation === r ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.relationChipText,
                  { color: newRelation === r ? "#fff" : colors.textSecondary },
                ]}
              >
                {r}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={addMember}
          disabled={!newName.trim()}
          style={[
            styles.addBtn,
            { backgroundColor: newName.trim() ? colors.primary : colors.border },
          ]}
        >
          <Text style={styles.addBtnText}>Add to Family Tree</Text>
        </Pressable>
      </View>

      {/* Ancestral Surnames */}
      <Pressable
        onPress={() => setShowAncestral(!showAncestral)}
        style={[styles.sectionToggle, { borderColor: colors.border }]}
      >
        <ThemedText style={styles.sectionToggleText}>Ancestral Surnames</ThemedText>
        <Feather name={showAncestral ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
      </Pressable>

      {showAncestral && (
        <View style={styles.addSection}>
          {value.ancestralSurnames.length > 0 && (
            <View style={styles.chipRow}>
              {value.ancestralSurnames.map((s, idx) => (
                <View key={idx} style={[styles.chip, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.chipText, { color: colors.text }]}>{s}</Text>
                  <Pressable onPress={() => removeSurname(idx)}>
                    <Feather name="x" size={14} color={colors.textSecondary} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          <View style={styles.inlineInput}>
            <TextInput
              style={[styles.input, styles.flex1, { color: colors.text, borderColor: colors.border }]}
              placeholder="Maiden name or surname"
              placeholderTextColor={colors.textSecondary}
              value={newSurname}
              onChangeText={setNewSurname}
              onSubmitEditing={addSurname}
            />
            <Pressable
              onPress={addSurname}
              disabled={!newSurname.trim()}
              style={[
                styles.smallAddBtn,
                { backgroundColor: newSurname.trim() ? colors.primary : colors.border },
              ]}
            >
              <Feather name="plus" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}

      {/* Origin Notes */}
      <TextInput
        style={[styles.input, styles.notesInput, { color: colors.text, borderColor: colors.border }]}
        placeholder="Any notes about your family origins (countries, migration history, etc.)"
        placeholderTextColor={colors.textSecondary}
        value={originNotes}
        onChangeText={(v) => {
          setOriginNotes(v);
          onChange({ ...value, originNotes: v });
        }}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  listSection: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    paddingRight: Spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  memberRelation: {
    fontSize: Typography.caption.fontSize,
    marginTop: 2,
  },
  removeBtn: {
    padding: Spacing.xs,
  },
  addSection: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: Typography.body.fontSize,
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  relationPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  relationChip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 100,
    borderWidth: 1,
  },
  relationChipText: {
    fontSize: Typography.caption.fontSize,
  },
  addBtn: {
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: Typography.body.fontSize,
  },
  sectionToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  sectionToggleText: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 100,
  },
  chipText: {
    fontSize: Typography.caption.fontSize,
  },
  inlineInput: {
    flexDirection: "row",
    gap: Spacing.xs,
    alignItems: "center",
  },
  flex1: {
    flex: 1,
  },
  smallAddBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
});
