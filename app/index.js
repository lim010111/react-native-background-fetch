import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { router } from "expo-router";
import * as webBrowser from "expo-web-browser";
import {
  GithubAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from "firebase/auth";
import { useEffect } from "react";
import { Image, ImageBackground, StyleSheet, View } from "react-native";
import CustomButton from "../components/Custombutton";
import CustomText from "../components/CustomText";
import { auth } from "../firebaseConfig.mjs";
import { createTokenWithCode } from "../utils/createTokenWithCode";

webBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint: `https://github.com/settings/connections/applications/${process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID}`,
};

export default function Login() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
      scopes: ["repo", "identity", "user:email"],
      redirectUri: makeRedirectUri(),
    },
    discovery
  );

  useEffect(() => {
    handleResponse();
  }, [response]);

  async function handleResponse() {
    if (response.type === "success") {
      const { code } = response.params;
      const { access_token } = await createTokenWithCode(code);

      if (!access_token) return;

      const credential = GithubAuthProvider.credential(access_token);
      await signInWithCredential(auth, credential);

      router.replace("/AlarmList");
    }
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/AlarmList");
      }
    });
  });

  return (
    <View style={styles.container}>
      <CustomText
        text="Code Beep에 오신 것을 환영합니다!"
        style={styles.titleText}
      />
      <View>
        <ImageBackground
          source={require("../assets/code-beep-bubbles.png")}
          style={styles.bubbles}
        >
          <View style={styles.bubblesBox}>
            <CustomText text="자바스크립트 파일이" textColor="#000000" />
            <CustomText text="있는 리포지토리가" textColor="#000000" />
            <CustomText text="있어야 해요! >_" textColor="#000000" />
          </View>
        </ImageBackground>
        <Image
          source={require("../assets/code-beep-icon.png")}
          style={styles.icon}
        />
      </View>
      <CustomButton
        title="Github Login"
        source={require("../assets/github-logo.png")}
        onPress={() => promptAsync()}
      />
      <CustomText
        text="로그인 후 이용하실 수 있습니다"
        style={styles.guideText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#404040",
    gap: 20,
  },
  titleText: {
    fontSize: 20,
    margin: 20,
  },
  icon: {
    resizeMode: "center",
    width: 150,
    height: 150,
    marginBottom: 5,
  },
  bubbles: {
    flex: 0,
    width: 150,
    height: 150,
  },
  bubblesBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginBottom: 20,
  },
  guideText: {
    fontSize: 14,
    margin: 10,
    color: "#808080",
  },
});
