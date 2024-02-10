// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/AccessControl.sol";

//____________________________________________________________________________________________________//
contract testTask is AccessControl { 
    struct UserData{
        uint value;        
        bool revealed;
        bool participated;
    }
    mapping (address => mapping(uint64 => UserData))  userData;

    struct Game{
        uint startTime;
        uint medianValue;
        uint[] allValues;
        address[] allUsers;
        address[] winner;
        uint    sorted;
        uint    checked;
        uint minimalValueDifference;
    }
    mapping (uint64 => Game) game; 

    uint   public participationTime;
    uint16 public minimumPlayers;
    uint   public revealTime;
    uint64 public id;
    constructor(){
        _grantRole(DEFAULT_ADMIN_ROLE,msg.sender);
        participationTime = 180;
        minimumPlayers = 20;
        revealTime = 90;
    }
    event NewGame(uint64 id, uint startTime, uint endTime);
    event Winner(uint64 id, address[]);
//ADMIN_______________________________________________________________________________________________//
    function setParticipationTime(uint _participationTime)external onlyRole(DEFAULT_ADMIN_ROLE){
        participationTime = _participationTime;
    }

    function setMinimumPlayers(uint16 _minimumPlayers)external onlyRole(DEFAULT_ADMIN_ROLE){
        require(_minimumPlayers > 19, "Must be at least 20 players");
        minimumPlayers = _minimumPlayers; 
    }

    function setRevealTime(uint _revealTime)external onlyRole(DEFAULT_ADMIN_ROLE){
        revealTime = _revealTime;
    }

    function startGame()external onlyRole(DEFAULT_ADMIN_ROLE){
        require(game[id].startTime == 0, "Game has already started");
        game[id].startTime = block.timestamp;
        emit NewGame(id,block.timestamp,block.timestamp+participationTime);
    }

    function sortArray(uint _amount)external onlyRole(DEFAULT_ADMIN_ROLE){
        require(block.timestamp > game[id].startTime + participationTime, "Game is still active");
        require(game[id].allValues.length >= minimumPlayers, "Must be more players to end the game");
        uint sorted = game[id].sorted;
        uint[] storage array = game[id].allValues;
        uint temp;
        if((sorted + _amount > array.length) || _amount == 0)
            _amount = array.length - sorted;

        for(uint i = sorted; i < sorted + _amount; i++){
            for(uint j = i;  j < sorted + _amount; j++){
                if (array[i] > array[j]) {
                    temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
            }
        }
        game[id].sorted += _amount; 
        if(game[id].sorted==array.length)
            if(array.length % 2 == 1)
                game[id].medianValue = array[array.length/2];
            else 
                game[id].medianValue = (array[array.length/2] + array[array.length/2 - 1])/2;
    }
    function findWinner(uint _amount)external onlyRole(DEFAULT_ADMIN_ROLE){
        require(game[id].sorted == game[id].allValues.length, "sort array first");
        uint checked = game[id].checked;
        address[] memory array = game[id].allUsers;
        if(checked == 0){
            if(game[id].allValues[0] > game[id].medianValue)
                game[id].minimalValueDifference = game[id].allValues[0] - game[id].medianValue;
            else
                game[id].minimalValueDifference = game[id].medianValue - game[id].allValues[0];
        }
        if((checked + _amount > array.length) || _amount == 0)
            _amount = array.length - checked;

        for(uint i = checked; i < checked + _amount; i++){
            if(userData[array[i]][id].value > game[id].medianValue){
                if(userData[array[i]][id].value - game[id].medianValue < game[id].minimalValueDifference){
                    game[id].minimalValueDifference = userData[array[i]][id].value - game[id].medianValue;
                    delete game[id].winner;
                    game[id].winner.push(array[i]); 
                    continue;
                }
                if(userData[array[i]][id].value - game[id].medianValue == game[id].minimalValueDifference){
                    game[id].winner.push(array[i]); 
                    continue;
                }
            } else {
                if(game[id].medianValue - userData[array[i]][id].value < game[id].minimalValueDifference){
                    game[id].minimalValueDifference = game[id].medianValue - userData[array[i]][id].value;
                    delete game[id].winner;
                    game[id].winner.push(array[i]); 
                    continue;
                }
                if(game[id].medianValue - userData[array[i]][id].value == game[id].minimalValueDifference){
                    game[id].winner.push(array[i]); 
                    continue;
                }
            }
        }

        game[id].checked += _amount;
        if(game[id].checked == game[id].allUsers.length){
            emit Winner(id,game[id].winner);
            id++;
        }

    }
//USER________________________________________________________________________________________________//
    function setValue(uint _value)external{
        require((game[id].startTime > 0) && (game[id].startTime < block.timestamp + participationTime), "Game is not active");
        require(!userData[msg.sender][id].participated,"You can't change the value");
        userData[msg.sender][id].participated = true;
        userData[msg.sender][id].value = _value;
        game[id].allUsers.push(msg.sender);
        game[id].allValues.push(_value);      
    }

    function revealValue()external{
        require((block.timestamp > game[id].startTime + participationTime) && (game[id].startTime + participationTime + revealTime > block.timestamp), "You can't reveal value now");
        userData[msg.sender][id].revealed = true;
    }
//VIEW________________________________________________________________________________________________//
    function getUserData(address _user, uint64 _id)external view returns(uint _value){
        require(msg.sender == _user || userData[_user][_id].revealed, "Value is not revealed");
        _value = userData[_user][_id].value;
    }

    function getStartTime(uint64 _id)external view returns(uint _startTime){
        _startTime = game[_id].startTime;
    }

    function getWinner(uint64 _id)external view returns(address[] memory _winner){
        _winner = game[_id].winner;
    }
// only to check values
//____________________________________________________________________________________________________//
    function getArray(uint64 _id)external view returns(uint[] memory _values){
        _values = game[_id].allValues;
    }

   function getMedian(uint64 _id)external view returns(uint _values){
        _values = game[_id].medianValue;
    }
}
