import React from "react";
import { View, Text, Pressable } from "react-native";

import tw from "~/styles/tailwind";
import * as icons from "~/assets/icons";
import { useSwapContext } from "~/context";

import { PrimaryButton } from "~/components/Common";

import { SwapFormCard } from "./SwapFormCard";
import { FormHeader } from "./FormHeader";

export const SwapForm: React.FC<{
  onSubmit: () => void;
  isDisabled: boolean;
  setSelectPairSelector: React.Dispatch<React.SetStateAction<"fromMint" | "toMint" | null>>;
  setShowRouteSelector(toggle: boolean): void;
  setShowSettingsModal(): void;
}> = ({ onSubmit, isDisabled, setSelectPairSelector, setShowRouteSelector, setShowSettingsModal }) => {
  const {
    form,
    setForm,
    errors,
    fromTokenInfo,
    toTokenInfo,
    selectedSwapRoute,
    formProps: { swapMode, fixedAmount, fixedInputMint, fixedOutputMint },
    jupiter: { routes, loading, refresh },
  } = useSwapContext();

  const marketRoutes = selectedSwapRoute ? selectedSwapRoute.marketInfos.map(({ label }) => label).join(", ") : "";

  const onClickSwitchPair = () => {
    setForm((prev) => ({
      ...prev,
      fromValue: "",
      toValue: "",
      fromMint: prev.toMint,
      toMint: prev.fromMint,
    }));
  };

  const onChangeFromValue = (value: string, isFromToken: boolean) => {
    if (value === "") {
      setForm((form) => ({ ...form, fromValue: "", toValue: "" }));
      return;
    }

    const isInvalid = Number.isNaN(value);
    if (isInvalid) return;

    setForm((form) => ({ ...form, fromValue: value }));
  };

  return (
    <View>
      <FormHeader handleOpenSettingsModal={() => setShowSettingsModal()} />
      <View style={tw`flex flex-column gap-10px`}>
        {fromTokenInfo && (
          <SwapFormCard
            token={fromTokenInfo}
            value={form.fromValue}
            isFromToken={true}
            handleChangeFromValue={(value) => onChangeFromValue(value, true)}
            handleChangePair={() => setSelectPairSelector("fromMint")}
          />
        )}
        <View style={tw`flex justify-center items-center`}>
          <Pressable
            onPress={() => onClickSwitchPair()}
            style={tw`border border-black/50 fill-current text-black bg-black/10 dark:text-white-35 dark:hover:text-white/50 dark:border dark:border-white-35 dark:hover:border-white/50 h-8 w-8 rounded-full flex items-center justify-center cursor-pointer`}
          >
            <View style={tw`block rotate-45`}>
              <icons.SwitchPairIcon />
            </View>
          </Pressable>
        </View>
        {toTokenInfo && (
          <SwapFormCard
            token={toTokenInfo}
            value={form.toValue}
            isFromToken={false}
            handleChangeFromValue={(value) => onChangeFromValue(value, false)}
            handleChangePair={() => setSelectPairSelector("toMint")}
          />
        )}
      </View>
      {routes ? (
        <View style={tw`flex flex-row items-center mt-2 text-xs space-x-1 gap-4px`}>
          <Pressable
            style={tw`bg-black/20 rounded-xl px-2 py-1 cursor-pointer text-white/50 flex flex-row items-center space-x-1 gap-2px`}
            onPress={() => setShowRouteSelector(true)}
          >
            <Text style={tw`text-secondary`}>{routes?.length}</Text>
            <icons.RoutesSVG width={7} height={9} />
          </Pressable>
          <Text style={tw`text-secondary`}>using</Text>
          <Text style={tw`text-white/50 overflow-hidden whitespace-nowrap text-ellipsis max-w-[70%]`}>
            {marketRoutes}
          </Text>
        </View>
      ) : (
        <></>
      )}
      <View style={tw`my-20px`}>
        <PrimaryButton
          title={loading ? "Loading..." : "Swap"}
          isDisabled={loading || isDisabled}
          onPress={() => {
            !loading && onSubmit();
          }}
        />
      </View>
    </View>
  );
};
