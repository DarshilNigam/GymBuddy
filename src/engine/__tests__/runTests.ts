import { runAllDetectorTests } from './exerciseDetectors.test';
import { runAllDataIntegrityTests } from '../../services/__tests__/dataIntegrity.test';

console.log('==================================================');
console.log('GYMBUDDY MASTER TEST SUITE');
console.log('==================================================\n');

const detectorResults = runAllDetectorTests();
console.log('');
const integrityResults = runAllDataIntegrityTests();

const totalPassed = detectorResults.passed + integrityResults.passed;
const totalFailed = detectorResults.failed + integrityResults.failed;
const totalTests = detectorResults.total + integrityResults.total;

console.log('\n==================================================');
console.log(`FINAL SUMMARY: ${totalPassed}/${totalTests} PASSED (${totalFailed} FAILED)`);
console.log('==================================================');

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

