import { Address, Cell, internal, toNano } from '@ton/core'
import {getSecureRandomBytes, mnemonicToPrivateKey, mnemonicToWalletKey} from '@ton/crypto'
import { execSync } from 'child_process';
import fs from 'fs'
import {TonClient, TonClient4, WalletContractV4} from '@ton/ton';
import dotenv from 'dotenv'

import {getHttpEndpoint} from "@orbs-network/ton-access";

dotenv.config()

let bestGiver: { address: string, coins: number } = { address: 'EQAV3tsPXau3VJanBw4KCFaMk3l_n3sX8NHZNgICFrR-9EGE', coins: 100 }
// let bestGiver: { address: string, coins: number } = { address: 'EQCvMmHhSYStEtUAEDrpV39T2GWl-0K-iqCxSSZ7I96L4yow', coins: 1000 }

let go = true
let i = 0
async function main() {


    const endpoint1 = await getHttpEndpoint({
        network: "mainnet",
    });
    const client1 = new TonClient({ endpoint:endpoint1 });
    let endpoint4 = "https://mainnet-v4.tonhubapi.com";
    const client4 = new TonClient4({ endpoint:endpoint4 });
    let ownerMnemonics = (process.env.MNEMONIC || "").toString();
    let ownerKeyPair = await mnemonicToPrivateKey(ownerMnemonics.split(" "));
    let ownerTonWallet = WalletContractV4.create({
        workchain: 0,
        publicKey: ownerKeyPair.publicKey,
    });

    let openedWallet = client4.open(ownerTonWallet);
    while (go) {
        const giverAddress = bestGiver.address
        const powInfo = await client1.runMethod(Address.parse(giverAddress), 'get_pow_params')
        let tupleReader = powInfo.stack;
        const seed = tupleReader.readBigNumber()
        const complexity = tupleReader.readBigNumber()
        const iterations = tupleReader.readBigNumber()

        const randomName = (await getSecureRandomBytes(8)).toString('hex') + '.boc'
        const path = `./bocs/${randomName}`
        // const command1 = `.\\pow-miner-cuda.exe -g 0 -F 128 -t 5 ${ownerTonWallet.address.toString({ urlSafe: true, bounceable: true })} ${seed} ${complexity} ${iterations} ${giverAddress} ${path}`
        const command = `./pow-miner -vv -w7 -t100 ${ownerTonWallet.address.toString({ urlSafe: true, bounceable: true })} ${seed} ${complexity} ${iterations} ${giverAddress} ${path}`
        console.info(command)
        try {
            const output = execSync(command, { encoding: 'utf-8', stdio: "pipe" });  // the default is 'buffer'
        } catch (e) {
            console.error(e)
        }
        let mined: Buffer | undefined = undefined
        try {
            mined = fs.readFileSync(path)
            fs.rmSync(path)
        } catch (e) {
            //
        }
        if (!mined) {
            console.log(`${new Date()}: not mined`, seed, i++)
        }
        if (mined) {
            console.info("================")
            try {
                console.info(Cell.fromBoc(mined));
            } catch (e){
                console.error("!!! Fail to run Cell.fromBoc(mined) !!")
                console.info("++++++++++++++++++++++++")
                continue
            }


            const powInfo2 = await client1.runMethod(Address.parse(giverAddress), 'get_pow_params')
            let tupleReader2 = powInfo2.stack;
            const newSeed = tupleReader2.readBigNumber()
            if (newSeed !== seed) {
                console.log('Mined already too late seed')
                continue
            }

            console.log(`${new Date()}:     mined`, seed, i++)

            let seqno = 0
            try {
                seqno = (await openedWallet.getSeqno())
            } catch (e) {
                console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! getSeqno FAIL !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            }
            for (let j = 0; j < 5; j++) {
                try {
                    openedWallet.sendTransfer({
                        seqno,
                        secretKey: ownerKeyPair.secretKey,
                        messages: [internal({
                            to: giverAddress,
                            value: toNano('0.05'),
                            bounce: true,
                            body: Cell.fromBoc(mined)[0].asSlice().loadRef(),
                        })],
                        sendMode: 3 as any,
                    }).catch(e => {
                        console.log('send transaction error', e)
                    })
                    break
                } catch (e) {
                    if (j === 4) {
                        throw e
                    }
                }
            }
        }
    }
}
main().catch((e) => {console.error(e)})



const givers = [
    // { address: 'EQDSGvoktoIRTL6fBEK_ysS8YvLoq3cqW2TxB_xHviL33ex2', reward: 1000 },
    // { address: 'EQCvMmHhSYStEtUAEDrpV39T2GWl-0K-iqCxSSZ7I96L4yow', reward: 1000 },
    // { address: 'EQBvumwjKe7xlrjc22p2eLGT4UkdRnrmqmcEYT94J6ZCINmt', reward: 1000 },
    // { address: 'EQDEume45yzDIdSy_Cdz7KIKZk0HyCFIr0yKdbtMyPfFUkbl', reward: 1000 },
    // { address: 'EQAO7jXcX-fJJZl-kphbpdhbIDUqcAiYcAr9RvVlFl38Uatt', reward: 1000 },
    // { address: 'EQAvheS_G-U57CE55UlwF-3M-cc4cljbLireYCmAMe_RHWGF', reward: 1000 },
    // { address: 'EQCba5q9VoYGgiGykVazOUZ49UK-1RljUeZgU6E-bW0bqF2Z', reward: 1000 },
    // { address: 'EQCzT8Pk1Z_aMpNukdV-Mqwc6LNaCNDt-HD6PiaSuEeCD0hV', reward: 1000 },
    // { address: 'EQDglg3hI89dySlr-FR_d1GQCMirkLZH6TPF-NeojP-DbSgY', reward: 1000 },
    // { address: 'EQDIDs45shbXRwhnXoFZg303PkG2CihbVvQXw1k0_yVIqxcA', reward: 1000 }, // 1000

    { address: 'EQD7VspHSNS4VSpN7QQicNgSYoJ68CmdC6oL5ZEKHSXe26Sa', reward: 10000 },
    { address: 'EQC5uEgW0MkTbCRBZB72maxCZT3m14OK2FcSLVr2H_7MTTSF', reward: 10000 },
    { address: 'EQC2nD9nQNRhcfWhdBzRK-wdlTO4hGxnPFzdSxKN777tab2_', reward: 10000 },
    { address: 'EQAqd4vV0O5oGfA7bl6fVORD_Y4PTNZG82AC2BObBux51g2w', reward: 10000 },
    { address: 'EQDcOxqaWgEhN_j6Tc4iIQNCj2dBf9AFm0S9QyouwifYo9KD', reward: 10000 },
    { address: 'EQAjYs4-QKve9gtwC_HrKNR0Eaqhze4sKUmRhRYeensX8iu3', reward: 10000 },
    { address: 'EQBGhm8bNil8tw4Z2Ekk4sKD-vV-LCz7BW_qIYCEjZpiMF6Q', reward: 10000 },
    { address: 'EQCtrloCD9BHbVT7q8aXkh-JtL_ZDvtJ5Y-eF2ahg1Ru1EUl', reward: 10000 },
    { address: 'EQCWMIUBrpwl7OeyEQsOF9-ZMKCQ7fh3_UOvM2N5y77u8uPc', reward: 10000 },
    { address: 'EQD_71XLqY8nVSf4i5pqGsCjz6EUo2kQEEQq0LUAgg6AHolO', reward: 10000 }, // 10 000

    // { address: 'EQDUIeTNcRUqsz4bugyWl4q4vg16PN2EwiyyAIEbf7_WJZZH', reward: 100000 },
    // { address: 'EQC4qKAIM0Od4RFG-4MAY0dJ3j4Wrcs0jc1XeWKJURYB9KSz', reward: 100000 },
    // { address: 'EQC0Ssi1gl0IQKEGsCp91NeiTThdMqCzYvlX9sVLEU97rWqL', reward: 100000 },
    // { address: 'EQDO2_2zkIJPqBKeE_P1VvDYOJi1vGPgiKo0Aa6Z-bY7BeuG', reward: 100000 },
    // { address: 'EQADEy4zcVl-ADNMISdYSs5cVjJcHmwC9_phXXjqNKgME7j6', reward: 100000 },
    // { address: 'EQDWELx3CYohD9sIjhyEIhP915kL_3XthqruCbmcB0YTWDqQ', reward: 100000 },
    // { address: 'EQDdoh2hzGFHdQtiXJNPNrwA8yIGd4-sFxyuEr3z6JL5BIFi', reward: 100000 },
    // { address: 'EQALXKp6G-IjWTPEqFKILkqcql-43DcoPzJ21Z02abpBPaQK', reward: 100000 },
    // { address: 'EQBAHXFxs1ohHY2bzW9A-V0NDznkFlROkNF_oyppxlLfsyEJ', reward: 100000 },
    // { address: 'EQCUwgBew9u4NwwuFsfPsXX9a69K55uFcieaHtc-c37OYDJO', reward: 100000 },
]
