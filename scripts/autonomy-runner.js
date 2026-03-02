const selfLearning = require('../lib/automation/self-learning');

async function run() {
  const action = process.argv[2] || 'cycle';

  if (action === 'start') {
    await selfLearning.start();
    console.log('Autonomy started in interval mode');
    return;
  }

  if (action === 'analyze') {
    await selfLearning.analyzeAllUsers();
    console.log('Users analyzed');
    return;
  }

  if (action === 'optimize') {
    await selfLearning.optimizeSystem();
    console.log('System optimized');
    return;
  }

  await selfLearning.runLearningCycle();
  console.log('Learning cycle completed');
}

run().catch((error) => {
  console.error('Autonomy runner failed:', error);
  process.exit(1);
});
