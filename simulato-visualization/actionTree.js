let fs = require('fs');

function sankeyData(testDir) {

    let path = testDir;

    let testCases = [];

    let specifiedAction = process.argv[2];
    let specifiedActionParent = process.argv[3];



    function readDirandFile() {
        const files = fs.readdirSync(path);

        for (const file of files) {
            const contents = fs.readFileSync(path + file, 'utf8');
            testCases.push(JSON.parse(contents.toString()));
        }
    }

    readDirandFile(path);

    class treeNode {
        constructor(parentItem, actionNameItem, childrenItem) {
            this.parent = parentItem;
            this.actionName = actionNameItem;
            this.count = 1;
            this.children = childrenItem;
        }
    }

    let treeRoot;
    let actionNames = [];
    let actionNames1 = [];
    let actionNodes = [];

    function insertNode(insertedNode) {
        if (!treeRoot) {
            treeRoot = insertedNode
            actionNames.push({ parent: insertedNode.parent, actionName: insertedNode.actionName });
            return true;
        }
        let nodeExists = searchTree(insertedNode);
        if (nodeExists) {
            nodeExists.count++;
        }
        else {
            navigateToParent(treeRoot, insertedNode);
        }
    }
    function searchTree(searchNode) {
        if (!treeRoot) {
            return false;
        }
        else if (treeRoot.actionName == searchNode.actionName && treeRoot.parent == searchNode.parent) {
            return treeRoot;
        }
        else if (treeRoot.children) {
            return searchChildren(treeRoot.children, searchNode)
        }
        else {
            return false;
        }
    }
    function searchChildren(children, searchNode) {
        let childFound = false;
        for (let i = 0; i < children.length; i++) {
            if (children[i].actionName == searchNode.actionName && children[i].parent == searchNode.parent) {
                childFound = true;
                return children[i];
            }
            else if (children[i].children && childFound == false) {
                let childNode = searchChildren(children[i].children, searchNode);
                if (childNode) {
                    return childNode;
                }
            }
            else {
                return false;
            }
        };
    }
    function navigateToParent(node, insertedNode) {
        if (node.actionName == insertedNode.parent) {
            let nodeAdded = false;
            node.children.forEach(function (child) {
                if (child.actionName == insertedNode.actionName && child.parent == insertedNode.parent) {
                    child.count++;
                    nodeAdded = true;
                }
            })
            if (!nodeAdded) {
                node.children.push(insertedNode);
                actionNames.push({ parent: insertedNode.parent, actionName: insertedNode.actionName });
            }
        }
        else {
            for (let i = 0; i < node.children.length; i++) {
                navigateToParent(node.children[i], insertedNode)
            }
        }
    }
    function insertTestCase(testCase) {
        for (let i = 1; i < testCase.length; i++) {
            insertNode(new treeNode(testCase[i - 1].name, testCase[i].name, []))
        }
    }

    function printObject() {
        testCases.forEach(function (testCase) {
            insertTestCase(testCase);
        })

        if (specifiedAction && specifiedActionParent) {
            treeRoot = searchTree(new treeNode(specifiedActionParent, specifiedAction))
        }

        let i = 1;
        actionNames1.push({ node: 0, name: "entryComponent" })

        actionNames.forEach(function (action) {
            let actionNode = searchTree(new treeNode(action.parent, action.actionName))
            actionNames1.push({ node: i, name: actionNode.actionName })
            i++;
        })

        actionNames.forEach(function (action) {
            let actionNode = searchTree(new treeNode(action.parent, action.actionName))
            let source1;
            let target1;
            actionNames1.forEach(function (a1) {
                if (a1.name == actionNode.parent) {
                    source1 = a1.node;
                }
                if (a1.name == actionNode.actionName) {
                    target1 = a1.node;
                }
            })
            if (source1 == undefined) {
                source1 = 0;
            }
            actionNodes.push({ source: source1, target: target1, value: actionNode.count })
        })

        return { nodes: actionNames1, links: actionNodes };
    }

    printObject();

}

module.exports = sankeyData;