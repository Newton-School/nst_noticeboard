import { ObjectId } from "mongodb";

export type QuestionType =
  | "SHORT_ANSWER"
  | "PARAGRAPH"
  | "MULTIPLE_CHOICE"
  | "CHECKBOXES"
  | "DROPDOWN"
  | "DATE";

export interface IChoice {
  id: string;
  label: string;
}

export interface IQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  choices?: IChoice[];
}

export interface IForm {
  _id: ObjectId | string;
  title: string;
  description?: string;
  questions: IQuestion[];
  acceptingResponses: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type AnswerValue = string | string[];

export interface IFormResponse {
  _id: ObjectId | string;
  form: ObjectId | string;
  answers: Record<string, AnswerValue>;
  respondentEmail?: string;
  submittedAt: Date | string;
}

export type FormErrors = Record<string, string>;

export type SubmitState =
  | { status: "idle" }
  | { status: "error"; errors: FormErrors; message?: string }
  | { status: "success" };

export interface QuestionDraft {
  id: string;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  choices: IChoice[];
}

export interface FormDraft {
  title: string;
  description: string;
  acceptingResponses: boolean;
  questions: QuestionDraft[];
}

export type SaveFormState =
  | { status: "idle" }
  | { status: "error"; errors: FormErrors; message?: string }
  | { status: "saved"; formId: string };

export interface FormSummary {
  _id: string;
  title: string;
  questionCount: number;
  responseCount: number;
  acceptingResponses: boolean;
  updatedAt: string;
}
