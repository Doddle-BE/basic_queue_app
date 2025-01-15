"use server";

import { redirect } from "next/navigation";

export async function compute(formData: FormData) {
  const numberA = formData.get("numberA");
  const numberB = formData.get("numberB");
  const result = Number(numberA) + Number(numberB);
  console.log(result);

  redirect("/");
}
