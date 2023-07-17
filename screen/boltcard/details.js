import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import {
  I18nManager,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { CheckBox } from 'react-native-elements';

import {
  BlueButton,
  BlueFormTextInput,
  BlueText
} from '../../BlueComponents';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import alert from '../../components/Alert';
import navigationStyle from '../../components/navigationStyle';



const BoltCardDetails = () => {

    const { walletID } = useRoute().params;
    const { wallets, saveToDisk } = useContext(BlueStorageContext);
    const wallet = wallets.find(w => w.getID() === walletID);
    const { colors } = useTheme();
    const { navigate, goBack, setParams } = useNavigation();


    const stylesHook = StyleSheet.create({
        modalContent: {
          backgroundColor: colors.modal,
          borderTopColor: colors.foregroundColor,
          borderWidth: colors.borderWidth,
        },
        customAmount: {
          borderColor: colors.formBorder,
          borderBottomColor: colors.formBorder,
          backgroundColor: colors.inputBackgroundColor,
        },
        customAmountText: {
          color: colors.foregroundColor,
        },
        root: {
          backgroundColor: colors.elevated,
        },
        rootBackgroundColor: {
          backgroundColor: colors.elevated,
        },
        amount: {
          color: colors.foregroundColor,
        },
        label: {
          color: colors.foregroundColor,
        },
        modalButton: {
          backgroundColor: colors.modalButton,
        },
        textLabel1: {
          color: colors.feeText,
        },
        manageFundsButton: {
          backgroundColor: colors.redText
        }
    });

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [cardKeys, setCardKeys] = useState();

    const [txMax, setTxMax] = useState(0);
    const [pinEnabled, setPinEnabled] = useState(false);
    const [pinLimitSats, setPinLimitSats] = useState(0);

    const fetchCardDetails = async (w, reload = false) => {
        setLoading(true);
        w.getCardDetails(reload)
            .then(response => {
                // console.log('details', response);
                setDetails(response);
                saveToDisk();
                setLoading(false);
            })
            .catch(err => {
                console.log('ERROR', err.message);
                alert(err.message);
                goBack();
            });

        // w.getcardkeys().then(response => {
        //   setCardKeys(response);
        // }).catch(err => {
        //     console.log('ERROR', err.message);
        //     alert(err.message);
        //     goBack();
        // });
    }
    useEffect(() => {
        if(wallet) {
            fetchCardDetails(wallet);
        }
    }, [walletID]);

    useEffect(() => {
      if(details && details.tx_limit_sats) {
        setTxMax(details.tx_limit_sats);
      }
      if(details && details.pin_enable) {
        setPinEnabled(details.pin_enable == "Y" ? true : false);
      }
      if(details && details.pin_limit_sats) {
        setPinLimitSats(details.pin_limit_sats);
      }
    }, [details]);

    const updateCard = () => {
      wallet.updateCard(txMax, pinEnabled, pinEnabled ? pinLimitSats : details.pin_limit_sats).then(response => {
        console.log('UPDATE CARD RESPONSE ', response);
        fetchCardDetails(wallet, true);
        setEditMode(false);
      }).catch(err => {
        console.log('ERROR', err.message);
        alert(err.message);
      });
    }
    
    const cancelUpdate = () => {
      setTxMax(details.tx_limit_sats);
      setEditMode(false);
    }

    const enableCard = (enable) => {
      console.log('ENABLECARD', enable);
      wallet.enableCard(enable).then(response => {
        console.log('UPDATE CARD RESPONSE ', response);
        fetchCardDetails(wallet, true);
      }).catch(err => {
        console.log('ERROR', err.message);
        alert(err.message);
      });
    }
    
    

    return(
        <View style={[styles.root, stylesHook.root]}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={[styles.root, stylesHook.root]} keyboardShouldPersistTaps="always">
                <View style={styles.scrollBody}>
                    {loading ?
                        <BlueText>Loading....</BlueText> 
                    :
                        <>  
                            <View style={{marginBottom: 15}}>
                                {details && details.uid &&
                                  <>
                                      <Text style={[styles.textLabel1, stylesHook.textLabel1]}>Card UID</Text>
                                      <BlueText>{details.uid}</BlueText>
                                  </>
                                }
                                {details && details.tx_limit_sats &&
                                    <>
                                        <Text style={[styles.textLabel1, stylesHook.textLabel1]}>Transaction limit</Text>
                                        {editMode
                                          ?
                                          <BlueFormTextInput 
                                            keyboardType = 'numeric' 
                                            value={txMax.toString()} 
                                            onChangeText={(value) => {
                                              var newVal = value.replace(/[^0-9]/, '');
                                              setTxMax(newVal);
                                            }}
                                          />
                                          :
                                          <BlueText style={{fontSize:30}}>{details.tx_limit_sats} sats</BlueText>
                                        }
                                    </>
                                }
                                {details && details.pin_enable &&
                                    <>
                                        {editMode
                                          ?
                                          <CheckBox
                                              checkedColor="#0070FF" 
                                              checked={pinEnabled} 
                                              onPress={() => {setPinEnabled(!pinEnabled)}}
                                              title="Enable PIN" 
                                              containerStyle={{marginLeft: 0, marginRight: 0}}
                                          />
                                          :
                                          <>
                                            <Text style={[styles.textLabel1, stylesHook.textLabel1]}>Pin Enabled</Text>
                                            <BlueText style={{fontSize:30}}>{details.pin_enable == 'Y' ? 'YES' : 'NO'}</BlueText>
                                          </>
                                        }
                                    </>
                                }
                                {details && pinEnabled && details.pin_limit_sats &&
                                    <>
                                        <Text style={[styles.textLabel1, stylesHook.textLabel1]}>Pin Limit Sats</Text>
                                        {editMode
                                          ?
                                          <BlueFormTextInput 
                                            keyboardType = 'numeric' 
                                            value={pinLimitSats.toString()} 
                                            onChangeText={(value) => {
                                              var newVal = value.replace(/[^0-9]/, '');
                                              setPinLimitSats(newVal);
                                            }}
                                          />
                                          :
                                          <>
                                            <BlueText style={{fontSize:30}}>{details.pin_limit_sats} sats</BlueText>
                                          </>
                                        }
                                    </>
                                }

                            </View>
                            {
                              wallet.getWipeData()
                              ?
                              <BlueText style={{fontWeight: '700', marginTop: 30}}>THE CARD IS WIPED. Disconnect the card by clicking "Disconnect bolt card" button below</BlueText>
                              :
                                <>
                                  {editMode
                                    ?
                                    <View>
                                      <View style={{marginTop: 10}}>
                                        <BlueButton
                                          title="Save"
                                          onPress={updateCard}
                                        />
                                      </View>
                                      <View style={{marginTop: 5}}>
                                        <BlueButton
                                          title="Cancel"
                                          onPress={cancelUpdate}
                                          backgroundColor={colors.redBG}
                                        />
                                      </View>
                                    </View>
                                    :
                                    <View style={{marginTop: 5}}>
                                        <BlueButton
                                          title="Edit"
                                          onPress={() => setEditMode(true)}
                                        />
                                    </View>
                                  }
                                </>

                            }
                            {!editMode && details && details.lnurlw_enable &&
                                <>
                                    <Text style={[styles.textLabel1, stylesHook.textLabel1]}>Card Enable / Disable</Text>
                                    
                                    { !wallet.getWipeData()
                                      && 
                                      <>
                                        {!editMode &&
                                          <View style={{marginTop: 10}}>
                                            {details.lnurlw_enable == 'Y' ? 
                                              <BlueButton
                                                title="Temporarily Disable Card"
                                                onPress={() => {
                                                  enableCard('false')
                                                }}
                                                backgroundColor={colors.redBG}
                                              />
                                            : 
                                              <BlueButton
                                                title="Enable Card"
                                                onPress={() => {
                                                  enableCard('true')
                                                }}
                                              />
                                            }
                                          </View>
                                        }
                                      </>

                                    }
                                </>
                            }
                            
                            {!editMode &&
                              <View style={{alignItems: 'center', marginTop: 30}}>
                                <TouchableOpacity accessibilityRole="button" onPress={() => {
                                  navigate('BoltCardCreateRoot', {
                                    screen: 'BoltCardDisconnect',
                                    params: {
                                      walletID: walletID,
                                    },
                                  });
                                }}
                                >
                                  <View style={[styles.manageFundsButton, stylesHook.manageFundsButton]}>
                                  <Image 
                                    source={(() => {
                                      return require('../../img/bolt-card-unlink_black.png');
                                    })()} style={{width: 40, height: 30, marginTop:20, marginLeft: 'auto', marginRight: 'auto'}}
                                  />
                                    <Text style={styles.manageFundsButtonText}>Disconnect Bolt Card</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                            }
                        </>
                    }
                </View>
            </ScrollView>
            
        </View>
    );
}

const styles = StyleSheet.create({
    monospace: {
      fontFamily: "monospace"
    },
    modalContent: {
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        minHeight: 350,
        height: 350,
      },
      customAmount: {
        flexDirection: 'row',
        borderWidth: 1.0,
        borderBottomWidth: 0.5,
        minHeight: 44,
        height: 44,
        marginHorizontal: 20,
        alignItems: 'center',
        marginVertical: 8,
        borderRadius: 4,
      },
      root: {
        flexGrow: 1,
        justifyContent: 'space-between',
      },
      scrollBody: {
        marginTop: 32,
        flexGrow: 1,
        paddingHorizontal: 16,
      },
      share: {
        justifyContent: 'flex-end',
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 8,
      },
      link: {
        marginVertical: 16,
        paddingHorizontal: 32,
      },
      amount: {
        fontWeight: '600',
        fontSize: 36,
        textAlign: 'center',
      },
      label: {
        fontWeight: '600',
        textAlign: 'center',
        paddingBottom: 24,
      },
      modalButton: {
        paddingVertical: 14,
        paddingHorizontal: 70,
        maxWidth: '80%',
        borderRadius: 50,
        fontWeight: '700',
      },
      customAmountText: {
        flex: 1,
        marginHorizontal: 8,
        minHeight: 33,
      },
      textLabel1: {
        fontWeight: '500',
        fontSize: 14,
        marginVertical: 12,
        writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
      },
      manageFundsButton: {
        marginTop: 14,
        marginBottom: 10,
        borderRadius: 9,
        minHeight: 39,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
      },
      manageFundsButtonText: {
        color:'#000',
        fontWeight: '500',
        fontSize: 14,
        padding: 12,
      },
});

BoltCardDetails.navigationOptions = navigationStyle(
{
    closeButton: true,
    headerHideBackButton: true,
},
opts => ({ ...opts, title: "Bolt Card Details" }),
);

export default BoltCardDetails;