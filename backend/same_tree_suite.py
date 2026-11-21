"""Curated inputs and reference harnesses for LeetCode Same Tree."""
import json

from hidden_judge import prepare_suite

SAMPLES = [
    {'input': '[1,2,3]\n[1,2,3]', 'output': 'true'},
    {'input': '[1,2]\n[1,null,2]', 'output': 'false'},
    {'input': '[1,2,1]\n[1,1,2]', 'output': 'false'},
]

PYTHON = (
    """import json
from collections import deque
from typing import Optional

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def read_tree():
    values = json.loads(input())
    if not values:
        return None
    root = TreeNode(values[0])
    queue = deque([root])
    offset = 1
    while offset < len(values):
        node = queue.popleft()
        for name in ('left', 'right'):
            if offset == len(values):
                break
            value = values[offset]
            offset += 1
            if value is not None:
                child = TreeNode(value)
                setattr(node, name, child)
                queue.append(child)
    return root

# === USER SOLUTION ===

print(json.dumps(Solution().isSameTree(read_tree(), read_tree())))
""",
    """class Solution:
    def isSameTree(self, p, q):
        if p is None or q is None:
            return p is q
        return p.val == q.val and self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)
""",
)

CPP = (
    """#include <bits/stdc++.h>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
    TreeNode(int v, TreeNode* l, TreeNode* r) : val(v), left(l), right(r) {}
};

TreeNode* read_tree() {
    string line;
    getline(cin, line);
    if (line.size() <= 2) return nullptr;
    stringstream tokens(line.substr(1, line.size() - 2));
    string token;
    getline(tokens, token, ',');
    auto* root = new TreeNode(stoi(token));
    queue<TreeNode*> nodes;
    nodes.push(root);
    while (!nodes.empty()) {
        auto* node = nodes.front();
        nodes.pop();
        for (auto** child : {&node->left, &node->right}) {
            if (!getline(tokens, token, ',')) return root;
            if (token != "null") {
                *child = new TreeNode(stoi(token));
                nodes.push(*child);
            }
        }
    }
    return root;
}

// === USER SOLUTION ===

int main() {
    auto* p = read_tree();
    auto* q = read_tree();
    cout << boolalpha << Solution().isSameTree(p, q);
}
""",
    """class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (!p || !q) return p == q;
        return p->val == q->val && isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};
""",
)

JAVASCRIPT = (
    """const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
function TreeNode(val, left = null, right = null) {
    this.val = val; this.left = left; this.right = right;
}
function readTree(line) {
    const values = JSON.parse(line);
    if (!values.length) return null;
    const root = new TreeNode(values[0]);
    const queue = [root];
    let offset = 1;
    for (let i = 0; i < queue.length && offset < values.length; i++) {
        for (const side of ['left', 'right']) {
            const value = values[offset++];
            if (value != null) {
                queue[i][side] = new TreeNode(value);
                queue.push(queue[i][side]);
            }
        }
    }
    return root;
}
// === USER SOLUTION ===
console.log(JSON.stringify(isSameTree(readTree(lines[0]), readTree(lines[1]))));
""",
    """function isSameTree(p, q) {
    if (p === null || q === null) return p === q;
    return p.val === q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}
""",
)

HARNESSES = {'cpp': CPP, 'python': PYTHON, 'javascript': JAVASCRIPT}


def candidate_inputs():
    edge_pairs = [
        ([], []), ([], [0]), ([0], []), ([0], [0]),
        ([-10000], [10000]), ([1, None, 2, 3], [1, None, 2, None, 3]),
        (list(range(100)), list(range(99)) + [-1]),
    ]
    return ['\n'.join(json.dumps(tree, separators=(',', ':')) for tree in pair) for pair in edge_pairs]


def build(language):
    harness, reference = HARNESSES[language]
    return prepare_suite(harness, reference, language, SAMPLES, candidate_inputs())
