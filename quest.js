import chalk from "chalk";

async function questList(tokenaccess) {
    const url = "https://testnet-api.x1eco.com/quests";

    const headers = {
        'accept': '*/*',
        'accept-language': 'en,en-US;q=0.9,id;q=0.8',
        'areyouahuman': 'true',
        'authorization': tokenaccess,
        'content-type': 'application/json',
        'dnt': '1',
        'origin': 'https://testnet.x1ecochain.com',
        'priority': 'u=1, i',
        'referer': 'https://testnet.x1ecochain.com/',
        'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (err) {
            await new Promise((r) => setTimeout(r, 1500));
        }
    }
    return [];
}

async function completeQuest(questid, tokenaccess) {
    const url = `https://testnet-api.x1eco.com/quests?quest_id=${questid}`;

    const headers = {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'areyouahuman': 'true',
        'authorization': tokenaccess,
        'content-length': '0',
        'content-type': 'application/json',
        'origin': 'https://testnet.x1ecochain.com',
        'priority': 'u=1, i',
        'referer': 'https://testnet.x1ecochain.com/',
        'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
            });

            const data = await response.json().catch(() => ({}));
            if (response.ok) {
                return { success: true, ...data };
            } else {
                return { success: false, message: data.error || `HTTP ${response.status}` };
            }
        } catch (err) {
            if (attempt === 2) {
                return { success: false, message: err.message };
            }
            await new Promise((r) => setTimeout(r, 1500));
        }
    }
    return { success: false, message: 'Timeout' };
}

async function claimFaucet(address, tokenaccess) {
    const url = `https://nft-api.x1eco.com/testnet/faucet?address=${address}`;

    const headers = {
        'accept': '*/*',
        'accept-language': 'en,en-US;q=0.9,id;q=0.8',
        'authorization': tokenaccess,
        'content-type': 'application/json',
        'dnt': '1',
        'origin': 'https://testnet.x1ecochain.com',
        'priority': 'u=1, i',
        'referer': 'https://testnet.x1ecochain.com/',
        'sec-ch-ua': '"Google Chrome";v="153", "Not_A Brand";v="8", "Chromium";v="153"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            if (response.status === 429) {
                const waitSec = parseInt(response.headers.get('retry-after') || '20', 10);
                if (attempt === 1) {
                    process.stdout.write(chalk.gray(`   ⏳ IP Faucet Rate-limit, cooldown ${waitSec}s... `));
                    await new Promise((r) => setTimeout(r, (waitSec + 1) * 1000));
                    console.log(chalk.green('lanjut!'));
                    continue;
                }
                return { success: false, message: 'IP Rate Limit' };
            }

            const text = await response.text();
            let data = {};
            try { data = JSON.parse(text); } catch { data = { message: text }; }

            if (response.ok) {
                return { success: true, message: data.message || 'Token Berhasil Diklaim' };
            } else {
                const msg = data.message || data.error || text;
                if (msg.includes('24 hours') || msg.includes('once every') || msg.includes('already')) {
                    return { success: false, cooldown: true, message: 'Cooldown 24 Jam' };
                }
                return { success: false, message: msg || `HTTP ${response.status}` };
            }
        } catch (err) {
            return { success: false, message: err.message };
        }
    }
    return { success: false, message: 'Timeout' };
}

export { questList, completeQuest, claimFaucet };
