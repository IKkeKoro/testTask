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

    
    it('should change minimum players', async()=>{
        const {task} = await loadFixture(deploy)
        await task.setMinimumPlayers(42)
        expect(await task.minimumPlayers()).to.be.eq(42)
    })

    it('should revert if minimum players < 20', async()=>{
        const {task} = await loadFixture(deploy) 
        await expect(task.setMinimumPlayers(4)).to.be.revertedWith('Must be at least 20 players')
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
        await task.setValue(1337,'1')
        await time.increase(190)
        await task.revealValue(1337,'1')
        const id = await task.id()
        expect(await task.getUserData(users[0].address,id)).to.be.eq(1337)
    })

    it('should revert set value if partisipation time is over', async()=>{
        const {task} = await loadFixture(deploy)
        await task.startGame()
        await time.increase(300)
        await expect(task.setValue(1337,'1')).to.be.revertedWith("Game is not active")
    })

    it('should revert set value if key is empty', async()=>{
        const {task} = await loadFixture(deploy)
        await task.startGame()
        await expect(task.setValue(1337,'')).to.be.revertedWith("Setup private key first")
    })

    it('should revert changing value', async()=>{
        const {task} = await loadFixture(deploy)
        await task.startGame()
        await task.setValue(1337,'1')
        await expect(task.setValue(42,'2')).to.be.revertedWith("You can't change the value")
    })

    it('should reveal value', async()=>{
        const {users,task} = await loadFixture(deploy)
        await task.startGame()
        await task.setValue(1337,'1')
        const id = await task.id()
        await time.increase(190)
        await task.revealValue(1337,'1')
        expect(await task.connect(users[1]).getUserData(users[0].address,id)).to.be.eq(1337)
    })
    
    it('should revert if value is not reveal', async()=>{
        const {users,task} = await loadFixture(deploy)
        await task.startGame()
        await task.setValue(1337,'1')
        const id = await task.id()
        await expect(task.connect(users[1]).getUserData(users[0].address,id)).to.be.revertedWith("Value is not revealed")       
    })

    it('should revert value reveal if game is active', async()=>{
        const {task} = await loadFixture(deploy)
        await task.startGame()
        await task.setValue(1337,'1')
        await expect(task.revealValue(1337,'1')).to.be.revertedWith("You can't reveal value now")
    })

    it('should revert value reveal if value is wrong', async()=>{
        const {task} = await loadFixture(deploy)
        await task.startGame()
        await task.setValue(1337,'1')
        await time.increase(190)
        await expect(task.revealValue(1338,'1')).to.be.revertedWith("Private key or value is incorrect")
    })

    it('should revert value reveal if key is wrong', async()=>{
        const {task} = await loadFixture(deploy)
        await task.startGame()
        await task.setValue(1337,'1')
        await time.increase(190)
        await expect(task.revealValue(1337,'42')).to.be.revertedWith("Private key or value is incorrect")
    })

    it('should revert value reveal if reveal time is over', async()=>{
        const {task} = await loadFixture(deploy)
        await task.startGame()
        await task.setValue(1337,'1')
        await time.increase(300)
        await expect(task.revealValue(1337,'1')).to.be.revertedWith("You can't reveal value now")
    })

    it('should revert array sorting if game is still active', async()=>{
        const {task} = await loadFixture(deploy)
        await task.startGame()
        await expect(task.sortArray(0)).to.be.revertedWith("Game is still active")
    })

    it('should revert array sorting if reveal time is not over', async()=>{
        const {task} = await loadFixture(deploy)
        await task.startGame()
        await time.increase(190)
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
            await task.connect(users[i]).setValue(values[i],`${i}`)
        }
        await time.increase(190)
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).revealValue(values[i],`${i}`)
        }
        await time.increase(200)
        await task.sortArray(0) 
    })

    it('should find winners',async()=>{
        const {users,task} = await loadFixture(deploy)
        const values = [1500,1800,2900,1320,1900,2490,2400,1200,1000,1000,9400,2000,4900,5400,6800,2800,2850,1930,2900,2000]  // median 2200 => closest 2000 x2 and 2400
        await task.startGame()
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).setValue(values[i],`${i}`)
        }
        await time.increase(190)
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).revealValue(values[i],`${i}`)
        }
        await time.increase(200)
        await task.sortArray(0)
        await task.findWinner(0)
        console.log(await task.getWinner(0)) 
        const array = await task.getArray(0)
        console.log(array)
        console.log(await task.getMedian(0))
    })

    it('should find winners step by step',async()=>{
        const {users,task} = await loadFixture(deploy)
        const values = [3500,1800,2900,12320,1900,2490,4400,1200,1000,5000,9400,2000,4900,5400,6800,8800,2850,1930,2900,2000]  
        await task.startGame()
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).setValue(values[i],`${i}`)
        }
        await time.increase(190)
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).revealValue(values[i],`${i}`)
        }
        await time.increase(200)
        for(let i=0;i<4;i++)
            await task.sortArray(5)
        for(let i=0;i<4;i++)
            await task.findWinner(5)
        console.log(await task.getWinner(0)) 
        const array = await task.getArray(0)
        console.log(array)
        console.log(await task.getMedian(0))
    })

    it('should find winners step by step',async()=>{
        const {users,task} = await loadFixture(deploy)
        const values = [3500,1865,2900,12320,1900,6490,400,1200,1000,5000,9400,2300,4900,5400,6800,8800,2850,1930,3900,2000]  
        await task.startGame()
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).setValue(values[i],`${i}`)
        }
        await time.increase(190)
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).revealValue(values[i],`${i}`)
        }
        await time.increase(200)
   
        await task.sortArray(8)
        await task.sortArray(4)
        await task.sortArray(2)
        await task.sortArray(80)
        
        await task.findWinner(5)
        await task.findWinner(2)
        await task.findWinner(7)
        await task.findWinner(500)
        console.log(await task.getWinner(0)) 
        const array = await task.getArray(0)
        console.log(array)
        console.log(await task.getMedian(0))
    })

    it('should find winners if sort and find value is over than members amount',async()=>{
        const {users,task} = await loadFixture(deploy)
        const values = [3500,1800,2900,12326,1900,2492,3400,1200,1000,5000,9400,2000,4905,8400,6800,8800,3850,1930,2900,2000]  
        await task.startGame()
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).setValue(values[i],`${i}`)
        }
        await time.increase(190)
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).revealValue(values[i],`${i}`)
        }
        await time.increase(200)
        await task.sortArray(1000)
        await task.findWinner(1000)
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
            await task.connect(users[i]).setValue(values[i],`${i}`)
        }
        await time.increase(190)
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).revealValue(values[i],`${i}`)
        }
        await time.increase(200)
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
            await task.connect(users[i]).setValue(values[i],`${i}`)
        }
        await time.increase(190)
        for(let i=0;i<values.length;i++){
            await task.connect(users[i]).revealValue(values[i],`${i}`)
        }
        await time.increase(200)
        await task.sortArray(0)
        await task.findWinner(0)
        expect(await task.id()).to.be.eq(1)
    })
})
