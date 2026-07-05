import { loadActionApprovals, setActionApproval } from './action-store.js';

export const publisher = {
  async buildDraftQueue(recommendations) {
    const approvals = await loadActionApprovals();

    return recommendations.map((item, index) => {
      const id = `action-${index + 1}`;
      const stored = approvals[id];
      const status = stored?.status || 'Draft';

      return {
        id,
        title: item.title,
        why: item.why,
        status,
        approvalRequired: status !== 'Approved',
        approvedAt: stored?.approvedAt || null,
        updatedAt: stored?.updatedAt || null,
        estimatedImpact: item.estimatedImpact,
        confidence: item.confidence
      };
    });
  },
  async approve(actionId, status = 'Approved') {
    const saved = await setActionApproval(actionId, status);
    return {
      actionId,
      accepted: true,
      status: saved.status,
      approvedAt: saved.approvedAt,
      updatedAt: saved.updatedAt,
      note: saved.status === 'Approved'
        ? 'Action approved. Execution pathway remains reserved for future live publisher connectors.'
        : 'Action moved back to draft.'
    };
  }
};
