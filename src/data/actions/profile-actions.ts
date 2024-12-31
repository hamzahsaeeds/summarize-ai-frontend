"use server";
import qs from "qs";
import { mutateData } from "../services/mutate-data";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(
  userId: string,
  prevState: any,
  formData: FormData
) {
  const rawFormData = Object.fromEntries(formData);

  const query = qs.stringify({
    populate: "*",
  });

  const payload = {
    firstName: rawFormData.firstName,
    lastName: rawFormData.lastName,
    bio: rawFormData.bio,
  };

  const responseData = await mutateData(
    "PUT",
    `/api/users/${userId}?${query}`,
    payload
  );

  if (!responseData) {
    return {
      ...prevState,
      strapiErrors: null,
      message: "Ops! Something went wrong. Please try again.",
    };
  }

  if (responseData.error) {
    return {
      ...prevState,
      strapiErrors: responseData.error,
      message: "Failed to Update Profile.",
    };
  }

  revalidatePath("/dashboard/account");

  return {
    ...prevState,
    message: "Profile Updated",
    data: responseData,
    strapiErrors: null,
  };
}
