import { FC, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AirdropZone from "./AirdropZone";
import { WalletButton } from "./WalletButton";
import { useHotkeys } from "react-hotkeys-hook";
import { useMrgnlendStore, useUserProfileStore } from "~/store";

// Firebase
import { useRouter } from "next/router";
import { HotkeysEvent } from "react-hotkeys-hook/dist/types";
import { Badge } from "@mui/material";
import { useFirebaseAccount } from "../useFirebaseAccount";
import { groupedNumberFormatterDyn, processTransaction } from "@mrgnlabs/mrgn-common";
import { useWalletContext } from "../useWalletContext";
import { Features, isActive } from "~/utils/featureGates";
import { EMISSION_MINT_INFO_MAP } from "../AssetsList/AssetRow/AssetRow";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";

// @todo implement second pretty navbar row
const Navbar: FC = () => {
  useFirebaseAccount();

  const { connection } = useConnection();
  const { connected, walletAddress, wallet } = useWalletContext();
  const router = useRouter();
  const [accountSummary, selectedAccount, extendedBankInfos] = useMrgnlendStore((state) => [
    state.accountSummary,
    state.selectedAccount,
    state.extendedBankInfos,
  ]);
  const [showBadges, currentFirebaseUser, userPointsData, setShowBadges, fetchPoints] = useUserProfileStore((state) => [
    state.showBadges,
    state.currentFirebaseUser,
    state.userPointsData,
    state.setShowBadges,
    state.fetchPoints,
  ]);

  const [isHotkeyMode, setIsHotkeyMode] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(router.pathname);

  const bankAddressesWithEmissions: PublicKey[] = useMemo(() => {
    if (!selectedAccount) return [];
    return [...EMISSION_MINT_INFO_MAP.keys()]
      .map((bankMintSymbol) => {
        const uxdBankInfo = extendedBankInfos?.find((b) => b.isActive && b.meta.tokenSymbol === bankMintSymbol);
        return uxdBankInfo?.address;
      })
      .filter((address) => address !== undefined) as PublicKey[];
  }, [selectedAccount, extendedBankInfos]);

  useEffect(() => {
    if (!walletAddress) return;
    fetchPoints(walletAddress.toBase58()).catch(console.error);
  }, [fetchPoints, walletAddress]);

  useEffect(() => {
    setCurrentRoute(router.pathname);
  }, [router.pathname]);

  // Enter hotkey mode
  useHotkeys(
    "meta+k",
    () => {
      setIsHotkeyMode(true);
      setShowBadges(true);

      setTimeout(() => {
        setIsHotkeyMode(false);
        setShowBadges(false);
      }, 5000);
    },
    { preventDefault: true, enableOnFormTags: true }
  );

  // Navigation in hotkey mode
  useHotkeys(
    "l, s, b, e, o",
    (_, handler: HotkeysEvent) => {
      if (isHotkeyMode) {
        switch (handler.keys?.join("")) {
          case "l":
            router.push("/");
            break;
          case "s":
            router.push("/swap");
            break;
          case "b":
            router.push("/bridge");
            break;
          case "e":
            router.push("/earn");
            break;
          case "o":
            router.push("https://omni.marginfi.com");
            break;
        }
        setIsHotkeyMode(false);
        setShowBadges(false);
      }
    },
    { preventDefault: currentRoute == "/" ? true : false, enableOnFormTags: true }
  );

  useHotkeys(
    "meta+k",
    () => {
      setShowBadges(true);
      setTimeout(() => {
        setShowBadges(false);
      }, 5000);
    },
    { enableOnFormTags: true }
  );

  useHotkeys(
    "meta+k",
    () => {
      setShowBadges(false);
    },
    { keyup: true, enableOnFormTags: true }
  );

  return (
    <header>
      <nav className="fixed w-full top-0 h-[64px] z-20 bg-[#0F1111]">
        <div className="w-full top-0 flex justify-between items-center h-16 text-sm font-[500] text-[#868E95] z-10 border-b-[0.5px] border-[#1C2125] px-4">
          <div className="h-full w-1/2 flex justify-start items-center z-10 gap-4 lg:gap-8">
            <Link
              href={"https://app.marginfi.com"}
              className="h-[35.025px] w-[31.0125px] min-h-[35.025px] min-w-[31.0125px] flex justify-center items-center"
            >
              <Image src="/marginfi_logo.png" alt="marginfi logo" height={35.025} width={31.0125} />
            </Link>
            <Badge
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "rgb(220, 232, 93)",
                  color: "#1C2125",
                },
              }}
              badgeContent={"l"}
              invisible={!showBadges}
            >
              <Link
                href={"/"}
                className={`${
                  router.pathname === "/" ? "hover-underline-static" : "hover-underline-animation"
                } hidden md:block`}
              >
                lend
              </Link>
            </Badge>

            {isActive(Features.STAKE) && (
              <Badge
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "rgb(220, 232, 93)",
                    color: "#1C2125",
                  },
                }}
                badgeContent={"e"}
                invisible={!showBadges}
              >
                <Link
                  href={"/stake"}
                  className={router.pathname === "/stake" ? "hover-underline-static" : "hover-underline-animation"}
                >
                  stake
                </Link>
              </Badge>
            )}

            <Badge
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "rgb(220, 232, 93)",
                  color: "#1C2125",
                },
              }}
              badgeContent={"s"}
              invisible={!showBadges}
            >
              <Link
                href={"/swap"}
                className={`${
                  router.pathname === "/swap" ? "hover-underline-static" : "hover-underline-animation"
                } hidden md:block`}
              >
                swap
              </Link>
            </Badge>
            <Badge
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "rgb(220, 232, 93)",
                  color: "#1C2125",
                },
              }}
              badgeContent={"b"}
              invisible={!showBadges}
            >
              <Link
                href={"/bridge"}
                className={`${
                  router.pathname === "/bridge" ? "hover-underline-static" : "hover-underline-animation"
                } hidden md:block`}
              >
                bridge
              </Link>
            </Badge>

            <Badge
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "rgb(220, 232, 93)",
                  color: "#1C2125",
                },
              }}
              badgeContent={"e"}
              invisible={!showBadges}
              className="hidden md:block"
            >
              <Link
                href={"/earn"}
                className={`${
                  router.pathname === "/earn" ? "hover-underline-static" : "hover-underline-animation"
                } hidden md:block`}
              >
                earn
              </Link>
            </Badge>

            <Link
              href={"/points"}
              className={`${
                router.pathname === "/points" ? "hover-underline-static" : "hover-underline-animation"
              } whitespace-nowrap`}
            >
              {connected && currentFirebaseUser
                ? `${groupedNumberFormatterDyn.format(Math.round(userPointsData.totalPoints))} points`
                : "points"}
            </Link>

            <Badge
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "rgb(220, 232, 93)",
                  color: "#1C2125",
                },
              }}
              badgeContent={"o"}
              invisible={!showBadges}
              className="hidden md:block"
            >
              <Link href={"https://omni.marginfi.com"} className="hover-underline-animation hidden md:block">
                omni
              </Link>
            </Badge>
            {process.env.NEXT_PUBLIC_MARGINFI_FEATURES_AIRDROP === "true" && connected && <AirdropZone />}
          </div>
          <div className="h-full w-1/2 flex justify-end items-center z-10 gap-4 lg:gap-8 text-[#868E95]">
            <div
              className={`whitespace-nowrap hidden md:inline-flex ${
                bankAddressesWithEmissions.length > 0 ? "cursor-pointer hover:text-[#AAA]" : "cursor-not-allowed"
              }`}
              onClick={async () => {
                if (!wallet || !selectedAccount || bankAddressesWithEmissions.length === 0) return;
                const tx = new Transaction();
                const ixs = [];
                const signers = [];
                for (const bankAddress of bankAddressesWithEmissions) {
                  const ix = await selectedAccount.makeWithdrawEmissionsIx(bankAddress);
                  ixs.push(...ix.instructions);
                  signers.push(ix.keys);
                }
                tx.add(...ixs);
                await processTransaction(connection, wallet, tx);
                toast.success("Withdrawal successful");
              }}
            >
              collect rewards
              {bankAddressesWithEmissions.length > 0 && (
                <span className="relative flex h-1 w-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DCE85D] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1 w-1 bg-[#DCE85DAA]"></span>
                </span>
              )}
            </div>

            <WalletButton />
          </div>
        </div>
      </nav>
    </header>
  );
};

export { Navbar };
