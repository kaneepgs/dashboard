export const publisher = {
  buildDraftQueue(recommendations) {
    return recommendations.map((item, index) => ({
      id: `action-${index + 1}`,
      title: item.title,
      why: item.why,
      status: 'Draft',
      approvalRequired: true,
      estimatedImpact: item.estimatedImpact,
      confidence: item.confidence
    }));
  },
  approve(actionId) {
    return {
      actionId,
      accepted: true,
      note: 'Execution pathway reserved for future live publisher connectors.'
    };
  }
};
