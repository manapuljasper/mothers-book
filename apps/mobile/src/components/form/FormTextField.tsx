import { TextInput } from "react-native";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { TextField } from "../ui";
import type { ComponentProps } from "react";

type TextFieldProps = ComponentProps<typeof TextField>;

interface FormTextFieldProps<T extends FieldValues>
  extends Omit<TextFieldProps, "value" | "onChangeText" | "error" | "ref"> {
  control: Control<T>;
  name: Path<T>;
}

/**
 * TextField integrated with react-hook-form
 * Automatically handles value binding and error display
 */
export function FormTextField<T extends FieldValues>({
  control,
  name,
  ...props
}: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value, ref },
        fieldState: { error },
      }) => (
        <TextField
          ref={ref as React.Ref<TextInput>}
          value={value ?? ""}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...props}
        />
      )}
    />
  );
}
