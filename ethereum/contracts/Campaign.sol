
pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public campaigns;

    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        campaigns.push(newCampaign);
    }

    function getCampaigns() public view returns(address[]){
        return campaigns;
    }
}

contract Campaign {

    struct Request {
        string description;
        uint amount;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address=>bool) approvals;
    }

    address public manager;
    uint public minimumContribution;
    Request[] public requests;
    mapping(address=>bool) public approvers;
    uint public approversCount;

    modifier restricted {
        require(msg.sender == manager);
        _;
    }

    function Campaign(uint minimum, address creator) public{
        manager = creator;
        minimumContribution = minimum;
    }

    function contribute() public payable{
        require(msg.value >= minimumContribution);

        approvers[msg.sender] = true;
        approversCount ++;
    }

    function createRequest(string description, uint amount, address recipient) restricted public {
        Request memory newRequest = Request({
            description: description,
            amount: amount,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });

        requests.push(newRequest);
    }

    function approveRequest(uint index) public {
        Request storage request = requests[index];
        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalCount ++;
    }

    function finalizeRequest(uint index) restricted public {
        Request storage request = requests[index];
        require(!request.complete);
        require(request.approvalCount > (approversCount / 2));

        request.recipient.transfer(request.amount);
        request.complete = true;
    }

    function getSummary() public view returns (uint, uint, uint, uint, address){
        return(
            minimumContribution,
            this.balance,
            requests.length,
            approversCount,
            manager
        );
    }

    function getRequestsCount() public view returns (uint){
        return requests.length;
    }
}