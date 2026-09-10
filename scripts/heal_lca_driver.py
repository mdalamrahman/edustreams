import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from backend.r2_storage import r2_storage

lca_cpp_driver = """#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <queue>
#include <algorithm>
#include <unordered_map>
#include <cctype>

using namespace std;

// === DATA STRUCTURES ===
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

// === USER SOLUTION ===

// === HIDDEN DRIVER ===
static inline string trim(const string& s) {
    size_t start = s.find_first_not_of(" \\t\\n\\r");
    if (start == string::npos) return "";
    size_t end = s.find_last_not_of(" \\t\\n\\r");
    return s.substr(start, end - start + 1);
}

static TreeNode* buildTree(const vector<string>& vals) {
    if (vals.empty() || vals[0] == "null" || vals[0].empty()) return nullptr;
    TreeNode* root = new TreeNode(stoi(vals[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t idx = 1;
    while (!q.empty() && idx < vals.size()) {
        TreeNode* curr = q.front();
        q.pop();
        if (idx < vals.size() && vals[idx] != "null" && !vals[idx].empty()) {
            curr->left = new TreeNode(stoi(vals[idx]));
            q.push(curr->left);
        }
        idx++;
        if (idx < vals.size() && vals[idx] != "null" && !vals[idx].empty()) {
            curr->right = new TreeNode(stoi(vals[idx]));
            q.push(curr->right);
        }
        idx++;
    }
    return root;
}

static TreeNode* findNode(TreeNode* root, int val) {
    if (!root) return nullptr;
    if (root->val == val) return root;
    TreeNode* left = findNode(root->left, val);
    if (left) return left;
    return findNode(root->right, val);
}

int main() {
    ios_base::sync_with_stdio(false);

    string raw_input = R"RAW(root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8)RAW";
    
    // Parse root array
    size_t rootStart = raw_input.find('[');
    size_t rootEnd = raw_input.find(']');
    vector<string> treeVals;
    if (rootStart != string::npos && rootEnd != string::npos && rootEnd > rootStart) {
        string inside = raw_input.substr(rootStart + 1, rootEnd - rootStart - 1);
        stringstream ss(inside);
        string item;
        while (getline(ss, item, ',')) {
            treeVals.push_back(trim(item));
        }
    }
    TreeNode* root = buildTree(treeVals);

    // Parse p
    int pVal = 0, qVal = 0;
    size_t pPos = raw_input.find("p =");
    if (pPos == string::npos) pPos = raw_input.find("p=");
    if (pPos != string::npos) {
        size_t comma = raw_input.find(',', pPos);
        string pStr = raw_input.substr(pPos + 3, (comma != string::npos ? comma - (pPos + 3) : string::npos));
        pVal = stoi(trim(pStr));
    }

    // Parse q
    size_t qPos = raw_input.find("q =");
    if (qPos == string::npos) qPos = raw_input.find("q=");
    if (qPos != string::npos) {
        size_t comma = raw_input.find(',', qPos);
        string qStr = raw_input.substr(qPos + 3, (comma != string::npos ? comma - (qPos + 3) : string::npos));
        qVal = stoi(trim(qStr));
    }

    TreeNode* pNode = findNode(root, pVal);
    TreeNode* qNode = findNode(root, qVal);

    Solution sol;
    TreeNode* ans = sol.lowestCommonAncestor(root, pNode, qNode);

    if (ans) {
        cout << ans->val << endl;
    } else {
        cout << "null" << endl;
    }

    return 0;
}
"""

slugs = [
    'lowest-common-ancestor-of-a-binary-search-tree',
    'lowest-common-ancestor-of-a-binary-tree'
]

for s in slugs:
    res = r2_storage.save_driver_to_problem(s, 'cpp', lca_cpp_driver)
    print(f"Saved corrected cpp driver for {s}: {res}")
