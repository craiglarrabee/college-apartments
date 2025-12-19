import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfirmField from "../../components/confirmField";
import {useForm, FormProvider} from "react-hook-form";

const Wrapper = ({value}) => {
  const methods = useForm({
    mode: "onBlur",
    defaultValues: {}
  });

  const {register, formState: {errors}, setValue} = methods;

  return (
    <FormProvider {...methods}>
      <form>
        <input aria-label="Original" defaultValue={value} readOnly />
        <ConfirmField name="phone" label="Phone" value={value} register={register} errors={errors} setValue={setValue} />
      </form>
    </FormProvider>
  );
};

describe("ConfirmField", () => {
  it("renders confirmation field correctly", () => {
    render(<Wrapper value="123-456-7890" />);
    const confirm = screen.getByPlaceholderText("Confirm Phone");
    expect(confirm).toBeInTheDocument();
    expect(screen.getByText(/Confirm Phone/)).toBeInTheDocument();
  });

  it("accepts input correctly", () => {
    render(<Wrapper value="111-222-3333" />);
    const confirm = screen.getByPlaceholderText("Confirm Phone");
    fireEvent.change(confirm, {target: {value: "111-222-3333"}});
    expect(confirm.value).toBe("111-222-3333");
  });
});
