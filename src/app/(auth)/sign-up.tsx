import { useSSO, useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAccount = async () => {
    if (!signUp || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await signUp.password({
        emailAddress,
        password,
      });

      if (error) {
        setErrorMessage(
          error.longMessage ?? error.message ?? "Unable to create account.",
        );
        return;
      }

      await signUp.verifications.sendEmailCode();
      setAwaitingVerification(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!signUp || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });

      if (error) {
        setErrorMessage(
          error.longMessage ?? error.message ?? "Unable to verify email.",
        );
        return;
      }

      if (signUp.status === "complete") {
        await signUp.finalize();
        router.replace("/" as Href);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to verify email.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/" as Href);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to continue with Google.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (awaitingVerification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.description}>
          Enter the code sent to your inbox.
        </Text>

        <TextInput
          keyboardType="numeric"
          onChangeText={setCode}
          placeholder="Verification code"
          style={styles.input}
          value={code}
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <Pressable
          disabled={!code || isSubmitting}
          onPress={handleVerifyEmail}
          style={({ pressed }) => [
            styles.button,
            (!code || isSubmitting) && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? "Verifying..." : "Verify"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        onChangeText={setEmailAddress}
        placeholder="you@example.com"
        style={styles.input}
        value={emailAddress}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        onChangeText={setPassword}
        placeholder="Choose password"
        secureTextEntry
        style={styles.input}
        value={password}
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Pressable
        disabled={!emailAddress || !password || isSubmitting}
        onPress={handleCreateAccount}
        style={({ pressed }) => [
          styles.button,
          (!emailAddress || !password || isSubmitting) && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Creating..." : "Create account"}
        </Text>
      </Pressable>

      <Pressable
        disabled={isSubmitting}
        onPress={handleGoogleSignUp}
        style={({ pressed }) => [
          styles.googleButton,
          isSubmitting && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </Pressable>

      <View style={styles.linkRow}>
        <Text style={styles.linkText}>Already have an account?</Text>
        <Link href={"/(auth)/sign-in" as Href} style={styles.link}>
          Sign in
        </Link>
      </View>

      <View nativeID="clerk-captcha" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    color: "#4b5563",
    fontSize: 14,
    marginBottom: 8,
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: {
    color: "#b91c1c",
    fontSize: 13,
    marginTop: 2,
  },
  button: {
    backgroundColor: "#0f766e",
    borderRadius: 10,
    marginTop: 8,
    paddingVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  googleButton: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 2,
    paddingVertical: 12,
  },
  googleButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  linkRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 8,
  },
  linkText: {
    color: "#4b5563",
  },
  link: {
    color: "#0f766e",
    fontWeight: "700",
  },
});
