import { Web3 } from "web3";
import { logIn, signMessage } from "./login.js";
import chalk from "chalk";
import { completeQuest, questList, claimFaucet } from "./quest.js";
import fs from "fs";

const web3 = new Web3("http://localhost:8545");

// ==========================================
// KONFIGURASI LAYOUT & ANSI COLOR HELPER
// ==========================================
const WIDTH = 60;
const INNER_WIDTH = WIDTH - 4; // 56
const stripAnsi = (str) => str.replace(/\u001b\[[0-9;]*m/g, '');
const hr = (char = '─', color = chalk.cyan) => color(char.repeat(WIDTH));
const getTime = () => chalk.gray(`[${new Date().toTimeString().split(' ')[0]}]`);

const padLine = (content) => {
    const visibleLen = stripAnsi(content).length;
    const padding = Math.max(0, INNER_WIDTH - visibleLen);
    return ' ' + content + ' '.repeat(padding) + ' ';
};

const centerLine = (content) => {
    const visibleLen = stripAnsi(content).length;
    const totalPad = Math.max(0, INNER_WIDTH - visibleLen);
    const leftPad = Math.floor(totalPad / 2);
    const rightPad = totalPad - leftPad;
    return ' ' + ' '.repeat(leftPad) + content + ' '.repeat(rightPad) + ' ';
};

// Helper Card Box Tertutup Presisi 60 Karakter
const buildTop = (title, color = chalk.cyan) => {
    const prefix = '┌─ [ ' + title + ' ] ';
    const fill = Math.max(0, WIDTH - prefix.length - 1);
    return color(prefix + '─'.repeat(fill) + '┐');
};

const buildBot = (color = chalk.cyan) => {
    return color('└' + '─'.repeat(WIDTH - 2) + '┘');
};

const padCard = (content, color = chalk.cyan) => {
    const visibleLen = stripAnsi(content).length;
    const padding = Math.max(0, WIDTH - 4 - visibleLen);
    return color('│ ') + content + ' '.repeat(padding) + color(' │');
};

// Tag status terstandar 12 karakter: [ BADGE    ]
const badges = {
    info:     chalk.bold.blue('[  INFO    ]'),
    success:  chalk.bold.green('[ SUCCESS  ]'),
    cooldown: chalk.bold.yellow('[ COOLDOWN ]'),
    stats:    chalk.bold.magenta('[  STATS   ]'),
    error:    chalk.bold.red('[  FAILED  ]')
};

async function setupWallet(privatekey) {
    const pkey = privatekey.startsWith('0x') ? privatekey : `0x${privatekey}`;
    const wallet = web3.eth.accounts.privateKeyToAccount(pkey);
    return wallet;
}

async function setupLogin(privatekey, messages) {
    const pkey = privatekey.startsWith('0x') ? privatekey : `0x${privatekey}`;
    const wallet = web3.eth.accounts.privateKeyToAccount(pkey);
    const sign = web3.eth.accounts.sign(messages, wallet.privateKey);
    return sign.signature;
}

async function main() {
    console.clear();

    let datas = [];
    try {
        const rawData = fs.readFileSync('datas.txt', 'utf-8');
        datas = rawData
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#') && !line.startsWith('//'));
    } catch (e) {
        if (e.code === 'ENOENT') {
            fs.writeFileSync('datas.txt', "0xprivatekey1\n0xprivatekey2\netc...\n");
            console.log(chalk.red('[!] File datas.txt tidak ditemukan. File template datas.txt baru saja dibuat!'));
            console.log(chalk.yellow('[i] Silakan masukkan private key ke datas.txt lalu jalankan ulang.\n'));
            process.exit(0);
        } else {
            throw e;
        }
    }

    if (datas.length === 0) {
        console.log(chalk.red('[!] File datas.txt masih kosong! Masukkan minimal 1 private key.'));
        process.exit(0);
    }

    // ==========================================
    // BOX HEADER PRESISI 60 KARAKTER
    // ==========================================
    console.log(chalk.cyan('╔' + '═'.repeat(WIDTH - 2) + '╗'));
    console.log(chalk.cyan('║' + centerLine(chalk.bold.cyan('X1 ECOCHAIN DAILY TASKS & FAUCET')) + '║'));
    console.log(chalk.cyan('║' + centerLine(chalk.gray('Auto Faucet, Send X1T, Daily & Quest Hunter')) + '║'));
    console.log(chalk.cyan('╠' + '═'.repeat(WIDTH - 2) + '╣'));
    console.log(chalk.cyan('║' + padLine(chalk.white('Network : ') + chalk.yellow('X1 Ecochain Testnet')) + '║'));
    console.log(chalk.cyan('║' + padLine(chalk.white('Modul   : ') + chalk.cyan('Faucet • Send X1T • Daily • Bonus')) + '║'));
    console.log(chalk.cyan('║' + padLine(chalk.white('Wallets : ') + chalk.green.bold(`${datas.length} Akun Terdeteksi`) + chalk.gray(' di datas.txt')) + '║'));
    console.log(chalk.cyan('╚' + '═'.repeat(WIDTH - 2) + '╝'));

    let totalFaucetSuccess = 0;
    let totalSendDone = 0;
    let totalDailyDone = 0;
    let totalBonusPoints = 0;
    let totalFailed = 0;

    for (let i = 0; i < datas.length; i++) {
        const privates = datas[i];

        try {
            const wallet = await setupWallet(privates);
            const shortAddr = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
            const cardTitle = `AKUN ${String(i + 1).padStart(2, '0')}/${String(datas.length).padStart(2, '0')} • ${shortAddr}`;

            // 1. Sign & Login
            const message = await signMessage(wallet.address);
            const sign = await setupLogin(wallet.privateKey, message.message);
            const login = await logIn(sign, wallet.address);

            if (login && login.token) {
                const tokenaccess = login.token;
                const address = login.user.address;
                let currentPoints = login.user.points || 0;

                // 2. Eksekusi Klaim Token Faucet
                const faucetRes = await claimFaucet(address, tokenaccess);

                // 3. Ambil Daftar Quest dari API
                const qList = await questList(tokenaccess);

                // 4. Eksekusi Task Harian: Claim Faucet (ID: 691fd162814608a47a30e4a6)
                let faucetBadge = '';
                let faucetText = '';
                const qFaucet = qList.find(q => q.id === "691fd162814608a47a30e4a6");

                if (qFaucet && !qFaucet.is_completed_today) {
                    const resFaucetTask = await completeQuest("691fd162814608a47a30e4a6", tokenaccess);
                    if (resFaucetTask.success) {
                        faucetBadge = badges.success;
                        faucetText = chalk.green('Token & Task Selesai (+1 Pt)');
                        totalFaucetSuccess++;
                        currentPoints += 1;
                    } else if (faucetRes.success) {
                        faucetBadge = badges.success;
                        faucetText = chalk.green('Token Berhasil Diklaim');
                        totalFaucetSuccess++;
                    } else {
                        faucetBadge = badges.cooldown;
                        faucetText = chalk.yellow('Cooldown 24 Jam');
                    }
                } else {
                    if (faucetRes.success) {
                        faucetBadge = badges.success;
                        faucetText = chalk.green('Token Diklaim & Task Selesai');
                        totalFaucetSuccess++;
                    } else {
                        faucetBadge = badges.cooldown;
                        faucetText = chalk.yellow('Cooldown 24 Jam');
                    }
                }

                // 5. Quest Send X1T (ID: 691fd151814608a47a30e4a4)
                let idquestSend = "691fd151814608a47a30e4a4";
                const qSend = qList.find(q => q.id === idquestSend);
                let sendBadge = '';
                let sendText = '';

                if (qSend && !qSend.is_completed_today) {
                    const resSend = await completeQuest(idquestSend, tokenaccess);
                    if (resSend.success) {
                        sendBadge = badges.success;
                        sendText = chalk.green('Selesai (+1 Pt)');
                        totalSendDone++;
                        currentPoints += 1;
                    } else {
                        sendBadge = badges.error;
                        sendText = chalk.gray('Belum Ada Tx Send');
                    }
                } else {
                    sendBadge = badges.cooldown;
                    sendText = chalk.yellow('Sudah Selesai');
                }

                // 6. Quest Daily Login (ID: 691fd172814608a47a30e4a8 atau via Login Signin)
                let idquestDaily = "691fd172814608a47a30e4a8";
                const qDaily = qList.find(q => q.id === idquestDaily || /daily.*login/i.test(q.title));
                let dailyBadge = '';
                let dailyText = '';

                if (qDaily && !qDaily.is_completed_today) {
                    const resDaily = await completeQuest(qDaily.id, tokenaccess);
                    if (resDaily.success) {
                        dailyBadge = badges.success;
                        dailyText = chalk.green('Selesai (+1 Pt)');
                        totalDailyDone++;
                        currentPoints += 1;
                    } else {
                        dailyBadge = badges.cooldown;
                        dailyText = chalk.yellow('Sudah Selesai');
                    }
                } else {
                    dailyBadge = badges.cooldown;
                    dailyText = chalk.yellow('Sudah Selesai');
                }

                // 7. Smart Quest Hunter (Otomatis klaim quest one-time / task bonus yang belum ter-klaim)
                let bonusGained = 0;
                const bonusCandidates = qList.filter(q => q.periodicity === 'one_time' && !q.is_completed);

                for (const bQuest of bonusCandidates) {
                    const bRes = await completeQuest(bQuest.id, tokenaccess);
                    if (bRes.success) {
                        bonusGained += (bQuest.reward || 0);
                    }
                }

                let bonusBadge = '';
                let bonusText = '';
                if (bonusGained > 0) {
                    bonusBadge = badges.success;
                    bonusText = chalk.green(`Task Bonus: +${bonusGained} Pts`);
                    currentPoints += bonusGained;
                    totalBonusPoints += bonusGained;
                } else {
                    bonusBadge = badges.cooldown;
                    bonusText = chalk.gray('Sudah Terklaim');
                }

                // ==========================================
                // CARD BOX TERTUTUP PRESISI 60 KARAKTER
                // ==========================================
                console.log('\n' + buildTop(cardTitle, chalk.cyan));
                console.log(padCard(chalk.white('Alamat : ') + chalk.cyan(address), chalk.cyan));
                console.log(padCard(chalk.white('Faucet : ') + faucetBadge + ' ' + faucetText, chalk.cyan));
                console.log(padCard(chalk.white('Send   : ') + sendBadge + ' ' + sendText, chalk.cyan));
                console.log(padCard(chalk.white('Daily  : ') + dailyBadge + ' ' + dailyText, chalk.cyan));
                console.log(padCard(chalk.white('Bonus  : ') + bonusBadge + ' ' + bonusText, chalk.cyan));
                console.log(padCard(
                    chalk.white('Points : ') + chalk.bold.yellow(currentPoints.toLocaleString() + ' Pts') +
                    chalk.gray(' • ') +
                    chalk.green('Status Aktif'),
                    chalk.cyan
                ));
                console.log(buildBot(chalk.cyan));

            } else {
                totalFailed++;
                console.log('\n' + buildTop(cardTitle, chalk.red));
                console.log(padCard(chalk.white('Alamat : ') + chalk.cyan(wallet.address), chalk.red));
                console.log(padCard(chalk.white('Status : ') + badges.error + ' ' + chalk.red('Gagal login ke X1'), chalk.red));
                console.log(padCard(chalk.gray('Detail : Periksa respon server/token'), chalk.red));
                console.log(buildBot(chalk.red));
            }
        } catch (err) {
            totalFailed++;
            const errorTitle = `AKUN ${String(i + 1).padStart(2, '0')}/${String(datas.length).padStart(2, '0')} • ERROR`;
            console.log('\n' + buildTop(errorTitle, chalk.red));
            console.log(padCard(chalk.white('Status : ') + badges.error + ' ' + chalk.red('Error pada akun'), chalk.red));
            console.log(padCard(chalk.gray(`Detail : ${err.message.slice(0, 44)}`), chalk.red));
            console.log(buildBot(chalk.red));
        }

        if (i < datas.length - 1) {
            console.log(chalk.gray(`  └─ Jeda santai 3s sebelum akun berikutnya...`));
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // ==========================================
    // RINGKASAN AKHIR
    // ==========================================
    console.log('\n' + hr('═', chalk.cyan));
    console.log(chalk.bold.cyan('✨ RINGKASAN X1 ECOCHAIN (FAUCET & QUESTS)'));
    console.log(` • Total Akun Diproses  : ${chalk.bold.white(datas.length)} Akun`);
    console.log(` • Faucet Berhasil      : ${chalk.bold.green(totalFaucetSuccess)} Akun`);
    console.log(` • Quest Send X1T Selesai: ${chalk.bold.green(totalSendDone)} Akun`);
    console.log(` • Quest Daily Check-in : ${chalk.bold.green(totalDailyDone)} Akun`);
    if (totalBonusPoints > 0) {
        console.log(` • Total Bonus Poin Baru: ${chalk.bold.yellow(`+${totalBonusPoints} Pts`)}`);
    }
    if (totalFailed > 0) {
        console.log(` • Gagal Login/Koneksi  : ${chalk.bold.red(totalFailed)} Akun`);
    }
    console.log(hr('═', chalk.cyan));
    console.log(chalk.green('\n✓ Seluruh wallet telah selesai diproses!\n'));
}

main().catch(err => {
    console.error(chalk.red('\n[FATAL ERROR]:'), err);
});
