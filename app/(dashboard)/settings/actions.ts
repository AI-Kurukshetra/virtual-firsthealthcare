"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";

export async function updateProfileAction(values: ProfileInput) {
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Please provide a valid name." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { error: "You must be signed in." };
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: parsed.data.fullName
    }
  });

  if (authError) {
    return { error: authError.message };
  }

  const { error: profileError } = await supabase
    .from("users")
    .update({
      full_name: parsed.data.fullName
    })
    .eq("id", userData.user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  return { success: "Profile updated." };
}
