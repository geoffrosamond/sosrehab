export type SignInGateState = "pending" | "error" | "signed_in" | "signed_out";

export type SignInGateInput = {
  isPending: boolean;
  hasError: boolean;
  hasUser: boolean;
};

export function resolveSignInGateState(
  input: SignInGateInput,
): SignInGateState {
  if (input.isPending) return "pending";
  if (input.hasError) return "error";
  return input.hasUser ? "signed_in" : "signed_out";
}
