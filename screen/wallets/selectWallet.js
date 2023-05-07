/* eslint-disable react/prop-types */
import { useNavigation, useNavigationState, useRoute, useTheme } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, I18nManager, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import LinearGradient from 'react-native-linear-gradient';

import { BluePrivateBalance, BlueSpacing20, BlueText, SafeBlueArea } from '../../BlueComponents';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import { LightningCustodianWallet, MultisigHDWallet } from '../../class';
import WalletGradient from '../../class/wallet-gradient';
import navigationStyle from '../../components/navigationStyle';
import loc, { formatBalance, transactionTimeToReadable } from '../../loc';

const SelectWallet = () => {
  const { chainType, onWalletSelect, availableWallets, noWalletExplanationText } = useRoute().params;
  const [isLoading, setIsLoading] = useState(true);
  const { pop, navigate, setOptions, dangerouslyGetParent } = useNavigation();
  const { wallets } = useContext(BlueStorageContext);
  const { colors, closeImage } = useTheme();
  const isModal = useNavigationState(state => state.routes.length) === 1;
  let data = chainType
    ? wallets.filter(item => item.chain === chainType && item.allowSend())
    : wallets.filter(item => item.allowSend()) || [];

  if (availableWallets && availableWallets.length > 0) {
    // availableWallets if provided, overrides chainType argument and `allowSend()` check
    data = availableWallets;
  }
  const styles = StyleSheet.create({
    loading: {
      flex: 1,
      justifyContent: 'center',
      alignContent: 'center',
      paddingTop: 20,
      backgroundColor: colors.background,
    },
    itemRoot: {
      backgroundColor: 'transparent',
      padding: 10,
      marginVertical: 17,
    },
    gradient: {
      padding: 15,
      borderRadius: 10,
      minHeight: 164,
      elevation: 5,
    },
    image: {
      width: 99,
      height: 94,
      position: 'absolute',
      bottom: 0,
      right: 0,
    },
    transparentText: {
      backgroundColor: 'transparent',
    },
    label: {
      backgroundColor: 'transparent',
      fontSize: 19,
      color: '#fff',
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    },

    balance: {
      backgroundColor: 'transparent',
      fontWeight: 'bold',
      fontSize: 36,
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',

      color: '#fff',
    },
    latestTxLabel: {
      backgroundColor: 'transparent',
      fontSize: 13,
      color: '#fff',
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    },
    latestTxValue: {
      backgroundColor: 'transparent',
      fontWeight: 'bold',
      fontSize: 16,
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',

      color: '#fff',
    },
    noWallets: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 20,
    },
    center: {
      textAlign: 'center',
    },
  });

  useEffect(() => {
    console.log('SelectWallet - useEffect');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setOptions(
      isModal
        ? {
            headerLeft: () => (
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.button}
                onPress={() => {
                  dangerouslyGetParent().pop();
                }}
                testID="NavigationCloseButton"
              >
                <Image source={closeImage} />
              </TouchableOpacity>
            ),
          }
        : {},
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeImage, isModal, styles.button]);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          ReactNativeHapticFeedback.trigger('selection', { ignoreAndroidSystemSettings: false });
          onWalletSelect(item, { navigation: { pop, navigate } });
        }}
        accessibilityRole="button"
      >
        <View shadowOpacity={40 / 100} shadowOffset={{ width: 0, height: 0 }} shadowRadius={5} style={styles.itemRoot}>
          <LinearGradient shadowColor="#000000" colors={WalletGradient.gradientsFor(item.type)} style={styles.gradient}>
            <Image
              source={(() => {
                switch (item.type) {
                  case LightningCustodianWallet.type:
                    return I18nManager.isRTL ? require('../../img/bolt-shape.png') : require('../../img/bolt-shape.png');
                  case MultisigHDWallet.type:
                    return I18nManager.isRTL ? require('../../img/vault-shape-rtl.png') : require('../../img/vault-shape.png');
                  default:
                    return I18nManager.isRTL ? require('../../img/btc-shape-rtl.png') : require('../../img/btc-shape.png');
                }
              })()}
              style={styles.image}
            />

            <Text style={styles.transparentText} />
            <Text numberOfLines={1} style={styles.label}>
              {item.getLabel()}
            </Text>
            {item.hideBalance ? (
              <BluePrivateBalance />
            ) : (
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.balance}>
                {formatBalance(Number(item.getBalance()), item.getPreferredBalanceUnit(), true)}
              </Text>
            )}
            <Text style={styles.transparentText} />
            <Text numberOfLines={1} style={styles.latestTxLabel}>
              {loc.wallets.list_latest_transaction}
            </Text>
            <Text numberOfLines={1} style={styles.latestTxValue}>
              {transactionTimeToReadable(item.getLatestTransactionTime())}
            </Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator />
      </View>
    );
  } else if (data.length <= 0) {
    return (
      <SafeBlueArea>
        <StatusBar barStyle="light-content" />
        <View style={styles.noWallets}>
          <BlueText style={styles.center}>{loc.wallets.select_no_bitcoin}</BlueText>
          <BlueSpacing20 />
          <BlueText style={styles.center}>{noWalletExplanationText || loc.wallets.select_no_bitcoin_exp}</BlueText>
        </View>
      </SafeBlueArea>
    );
  } else {
    return (
      <SafeBlueArea>
        <StatusBar barStyle="default" />
        <FlatList extraData={data} data={data} renderItem={renderItem} keyExtractor={(_item, index) => `${index}`} />
      </SafeBlueArea>
    );
  }
};

SelectWallet.navigationOptions = navigationStyle({}, opts => ({ ...opts, headerTitle: loc.wallets.select_wallet }));

export default SelectWallet;
