import * as crypto from 'crypto';
const hexToBinary = (hexData) => hexData.split('').map(i => parseInt(i, 16).toString(2).padStart(4, '0')).join('');
const hashing = (...blockDetails) => {
    return hexToBinary(crypto.createHash('sha256').update(blockDetails.sort().join("")).digest('hex'));
};
const miningRate = 10000; // Here the mining Rate is defined in milliseconds. so this is 10 seconds
class Block {
    constructor(object) {
        this.timeStamp = object.timestamp;
        this.prevBlockHash = object.prevBlockHash;
        this.currentBlockHash = object.currentBlockHash;
        this.data = object.data;
        this.nonce = object.nonce;
        this.difficulty = object.difficulty;
    }
    static genesis() {
        return new Block({ timestamp: 1668181324864, prevBlockHash: '0x0000000000000000000000000000000000000000000000000000000000000000 ', currentBlockHash: '0x07166e335add1e3831a7a8fce006660067eca119108cc62122722e2feaaadc', data: "Genesis Block Created", nonce: 0, difficulty: 15 });
    }
    static creatingBlock(miningData) {
        let nonceTimeStamp, currentHash, nonce = 0;
        let { difficulty } = miningData.prevBlock;
        const prevBlockHash = miningData.prevBlock.currentBlockHash;
        do {
            nonce++;
            nonceTimeStamp = Date.now();
            difficulty = Block.adjustingDifficulty({ timestamp: nonceTimeStamp, originalBlock: miningData.prevBlock });
            currentHash = hashing(nonce, nonceTimeStamp, miningData.data, prevBlockHash, difficulty);
        } while (currentHash.substring(0, difficulty) !== '0'.repeat(difficulty));
        console.log(difficulty);
        return new this({ timestamp: nonceTimeStamp, prevBlockHash: prevBlockHash, currentBlockHash: parseInt(currentHash, 2).toString(16).toUpperCase(), data: miningData.data, nonce: nonce, difficulty: difficulty });
    }
    static adjustingDifficulty(difficultyObject) {
        const { difficulty } = difficultyObject.originalBlock;
        if (difficulty < 1)
            return 1;
        const differenceInTimestamp = difficultyObject.timestamp - difficultyObject.originalBlock.timeStamp;
        if (differenceInTimestamp > miningRate) {
            return difficulty - 1;
        }
        else {
            return difficulty + 1;
        }
    }
}
const genesisBlock = Block.genesis();
class BlockChain {
    constructor() {
        this.chain = [genesisBlock];
    }
    addBlock(blockChainObject) {
        const newBlock = Block.creatingBlock({ prevBlock: this.chain[(this.chain.length) - 1], data: blockChainObject.data });
        this.chain.push(newBlock);
    }
    static validationCheck(newChain) {
        if (JSON.stringify(newChain.chain[0]) !== JSON.stringify(Block.genesis())) {
            console.error("Chain is not valid");
        }
        for (let i = 1; i < newChain.chain.length; i++) {
            const { currentBlockHash, prevBlockHash, data, difficulty, nonce, timeStamp } = newChain.chain[i];
            const lastBlockHash = newChain.chain[i - 1].currentBlockHash;
            if (prevBlockHash !== lastBlockHash)
                return "Chain is not valid";
            const hashingFuncHash = hashing(timeStamp, data, difficulty, nonce, prevBlockHash);
            if (currentBlockHash !== hashingFuncHash)
                return "Chain is not valid";
        }
        return "This Blockchain is valid";
    }
    selectingVerifiedChain(minerSentChain) {
        if (minerSentChain.chain.length <= this.chain.length) {
            console.error("This is not the longest Chain");
            return;
        }
        else if (!BlockChain.validationCheck(minerSentChain)) {
            console.error("This Chain is not valid");
            return;
        }
        else
            this.chain = minerSentChain.chain;
    }
}
const darkGuildBlockchain = new BlockChain();
const timeStampDifferences = [];
let prevBlockTimeStamp, nextBlockTimeStamp, timeDifference, avgTime;
darkGuildBlockchain.addBlock({ data: "sudeep sent monisha 8 ETH" });
darkGuildBlockchain.addBlock({ data: "monisha sent sudeep 10 ETH" });
darkGuildBlockchain.addBlock({ data: "ms" });
darkGuildBlockchain.addBlock({ data: "sudeep sent monisha 8 ETH" });
darkGuildBlockchain.addBlock({ data: "monisha sent sudeep 10 ETH" });
darkGuildBlockchain.addBlock({ data: "ms" });
for (let j = 2; j < darkGuildBlockchain.chain.length; j++) {
    prevBlockTimeStamp = darkGuildBlockchain.chain[j - 1].timeStamp;
    nextBlockTimeStamp = darkGuildBlockchain.chain[j].timeStamp;
    timeDifference = nextBlockTimeStamp - prevBlockTimeStamp;
    timeStampDifferences.push(timeDifference);
}
avgTime = timeStampDifferences.reduce((total, num) => total + num) / timeStampDifferences.length;
console.log(avgTime / 1000, "seconds");
const verification = BlockChain.validationCheck(darkGuildBlockchain);
if (verification) {
    console.log(darkGuildBlockchain);
}
