import { ComponentType } from "react";
import { QuestionType } from "@/types/form";
import { QuestionProps } from "./types";
import { ShortAnswerQuestion } from "./ShortAnswerQuestion";
import { ParagraphQuestion } from "./ParagraphQuestion";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { CheckboxesQuestion } from "./CheckboxesQuestion";
import { DropdownQuestion } from "./DropdownQuestion";
import { DateQuestion } from "./DateQuestion";

export const QUESTION_COMPONENTS: Partial<
  Record<QuestionType, ComponentType<QuestionProps>>
> = {
  SHORT_ANSWER: ShortAnswerQuestion,
  PARAGRAPH: ParagraphQuestion,
  MULTIPLE_CHOICE: MultipleChoiceQuestion,
  CHECKBOXES: CheckboxesQuestion,
  DROPDOWN: DropdownQuestion,
  DATE: DateQuestion,
};

export function getQuestionComponent(
  type: QuestionType,
): ComponentType<QuestionProps> | null {
  return QUESTION_COMPONENTS[type] ?? null;
}
