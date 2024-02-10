import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import "@nomicfoundation/hardhat-chai-matchers"
  import { expect } from "chai";
  import { ethers } from "hardhat";

describe("TestTask", function(){
    async function deploy() {
        const users = await ethers.getSigners()
        const Factory = await ethers.getContractFactory("testTask")
        const task = await Factory.deploy()
        await task.waitForDeployment()
        return {users, task}
    }
    
    it("should be deployed", async()=>{
        const {task} = await loadFixture(deploy)
        expect(task.target).to.be.properAddress
    })

    it('should revert if user has no access to admin functions', async()=>{
        const {users,task} = await loadFixture(deploy)
        await expect(task.connect(users[1]).setParticipationTime(200)).to.be.revertedWithCustomError(task,'AccessControlUnauthorizedAccount')
        await expect(task.connect(users[1]).startGame()).to.be.revertedWithCustomError(task,'AccessControlUnauthorizedAccount')
        await expect(task.connect(users[1]).setRevealTime(200)).to.be.revertedWithCustomError(task,'AccessControlUnauthorizedAccount')
        await expect(task.connect(users[1]).sortArray(0)).to.be.revertedWithCustomError(task,'AccessControlUnauthorizedAccount')
        await expect(task.connect(users[1]).findWinner(0)).to.be.revertedWithCustomError(task,'AccessControlUnauthorizedAccount')
    })

    it('should change participation time', async()=>{
        const {task} = await loadFixture(deploy)
        await task.setParticipationTime(200)
        expect(await task.participationTime()).to.be.eq(200)
    })

    it('should change reveal time', async()=>{
        const {task} = await loadFixture(deploy)
        await task.setRevealTime(42)
        expect(await task.revealTime()).to.be.eq(42)
    })

    it('should revert if the game has started ', async()=>{
        const {task} = await loadFixture(deploy)
        expect(await task.getStartTime(0)).to.be.eq(0)
        await task.startGame()
        await expect(task.startGame()).to.be.revertedWith("Game has already started")
    })


    it('should start the game', async()=>{
        const {task} = await loadFixture(deploy)
        expect(await task.getStartTime(0)).to.be.eq(0)
        await task.startGame()
        expect(await task.getStartTime(0)).to.be.greaterThan(0)
    })

    it('should set value', async()=>{
        const {users,task} = await loadFixture(deploy)
        await task.startGame()
        await task.setValue(1337)
        const id = await task.id()
        expect(await task.getUserData(users[0].address,id)).to.be.eq(1337)
    })

    it('should revert changing value', async()=>{
        const {task} = await loadFixture(deploy)
        await task.startGame()
        await task.setValue(1337)
        await expect(task.setValue(42)).to.be.revertedWith("You can't change the value")
    })

    it('should reveal value', async()=>{
        const {users,task} = await loadFixture(deploy)
        await task.startGame()
        await task.setValue(1337)
        const id = await task.id()
        await time.increase(190)
        await task.revealValue()
        expect(await task.connect(users[1]).getUserData(users[0].address,id)).to.be.eq(1337)
    })
    
    it('should revert if value is not reveal', async()=>{
        const {users,task} = await loadFixture(deploy)
        await task.startGame()
        await task.setValue(1337)
        const id = await task.id()
        await expect(task.connect(users[1]).getUserData(users[0].address,id)).to.be.revertedWith("Value is not revealed")       
    })

    it('should revert value reveal if game is active', async()=>{
        const {task} = await loadFixture(deploy)
        await task.startGame()
        await task.setValue(1337)
        await expect(task.revealValue()).to.be.revertedWith("You can't reveal value now")
    })

    it('should revert value reveal if reveal time is over', async()=>{
        const {task} = await loadFixture(deploy)
        await task.startGame()
        await task.setValue(1337)
        await time.increase(300)
        await expect(task.revealValue()).to.be.revertedWith("You can't reveal value now")
    })

    it('should revert array sorting if game is still active', async()=>{
        const {task} = await loadFixture(deploy)
        await task.startGame()
        await expect(task.sortArray(0)).to.be.revertedWith("Game is still active")
    })

    it('should revert array sorting if there less than the minimum number of players', async()=>{
        const {task} = await loadFixture(deploy)
        await task.startGame()
        await time.increase(300)
        await expect(task.sortArray(0)).to.be.revertedWith("Must be more players to end the game")
    })

    it('should sort array',async()=>{
        const {users,task} = await loadFixture(deploy)
        const values = [1500,1800,2900,1320,1900,2490,2400,1200,4200,1000,9400,2000,4900,5400,6800,2800,2850,1930,2900,2000]    
        await task.startGame()
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).setValue(i)
        }
        await time.increase(300)
        await task.sortArray(0) 
    })

    it('should find winners',async()=>{
        const {users,task} = await loadFixture(deploy)
        const values = [1500,1800,2900,1320,1900,2490,2400,1200,1000,1000,9400,2000,4900,5400,6800,2800,2850,1930,2900,2000]  // median 2200 => closet 2000 x2 and 2400
        await task.startGame()
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).setValue(values[i])
        }
        await time.increase(300)
        await task.sortArray(0)
        await task.findWinner(0)
        console.log(await task.getWinner(0)) 
        const array = await task.getArray(0)
        console.log(array)
        console.log(await task.getMedian(0))
    })

    it('should find all winners', async()=>{
        const {users,task} = await loadFixture(deploy)
        const values = [1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500]
        await task.startGame()
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).setValue(values[i])
        }
        await time.increase(300)
        await task.sortArray(0)
        await task.findWinner(0)
        console.log(await task.getWinner(0)) 
        const array = await task.getArray(0)
        console.log(array)
        console.log(await task.getMedian(0))
    })

    it('should change game id', async()=>{
        const {users,task} = await loadFixture(deploy)
        const values = [1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500]
        await task.startGame()
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).setValue(values[i])
        }
        await time.increase(300)
        await task.sortArray(0)
        await task.findWinner(0)
        expect(await task.id()).to.be.eq(1)
    })
})