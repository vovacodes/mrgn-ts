import React from "react";
import { View, Text, Pressable } from "react-native";
import tw from "~/styles/tailwind";

import * as icons from "~/assets/icons";
import useTimeDiff from "~/hooks/useTimeDiff";
import { PrimaryButton } from "~/components/Common";
import { useSwapContext } from "~/context";

import { PriceInfo } from "../PriceInfo";

interface props {
  onSubmit: () => void;
  onClose: () => void;
}

export const ReviewOrderModal = ({ onClose, onSubmit }: props) => {
  const {
    fromTokenInfo,
    toTokenInfo,
    selectedSwapRoute,
    jupiter: { routes, loading, refresh },
  } = useSwapContext();

  const [hasExpired] = useTimeDiff();

  const onGoBack = () => {
    onClose();
    refresh();
  };

  return (
    <View style={tw`flex flex-col h-full w-full py-4 px-2`}>
      <View style={tw`flex flex-row w-full justify-between`}>
        <Pressable style={tw`text-primary fill-current w-6 h-6 cursor-pointer`} onPress={onGoBack}>
          <icons.LeftArrowIcon width={24} height={24} />
        </Pressable>

        <Text style={tw`text-primary text-base`}>Review Order</Text>

        <View style={tw`w-6 h-6`} />
      </View>

      <View>
        {routes && selectedSwapRoute && fromTokenInfo && toTokenInfo ? (
          <PriceInfo
            routes={routes}
            selectedSwapRoute={selectedSwapRoute}
            fromTokenInfo={fromTokenInfo}
            toTokenInfo={toTokenInfo}
            loading={loading}
            showFullDetails
            containerClassName="bg-[#25252D] border-none"
          />
        ) : null}
      </View>

      {hasExpired ? (
        <PrimaryButton title={"Refresh"} onPress={onGoBack} />
      ) : (
        <PrimaryButton title={"Confirm"} onPress={onSubmit} />
      )}
    </View>
  );
};
