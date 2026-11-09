import crypto from 'crypto';

function verifyEvidence(factArray, resumeText) {
  if (!Array.isArray(factArray)) return [];
  const normalizedResumeText = resumeText.toLowerCase().replace(/\s+/g, ' ');
  
  return factArray.map(fact => {
    if (fact.evidence && Array.isArray(fact.evidence)) {
      fact.evidence = fact.evidence.filter(ev => {
        if (!ev.supportingText) return false;
        const normalizedEvidence = ev.supportingText.toLowerCase().replace(/\s+/g, ' ');
        return normalizedResumeText.includes(normalizedEvidence);
      });
    }
    return fact;
  }).filter(fact => {
    if (fact.name && (!fact.evidence || fact.evidence.length === 0)) return false;
    return true;
  });
}

function runTests() {
  let passed = 0;
  let total = 0;
  
  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
    } else {
      passed++;
      console.log(`✅ PASS: ${message}`);
    }
  }

  console.log("--- Deterministic Verification Tests ---");

  // 1. Normal ATS resume
  const atsResume = "Alex Smith\nSoftware Engineer\nAcme Corp, 2020-2023\nDeveloped backend services using Node.js and Postgres.";
  const facts1 = [{ name: "Node.js", evidence: [{ supportingText: "Node.js and Postgres" }] }];
  assert(verifyEvidence(facts1, atsResume).length === 1, "ATS Resume explicit evidence kept");

  // 2. Generic job title hallucination test
  const titleResume = "Software Engineer 2023-Present";
  const facts2 = [{ name: "Python", evidence: [{ supportingText: "Software Engineer" }] }]; // LLM invents Python from title
  assert(verifyEvidence(facts2, titleResume).length === 0, "Job title generic hallucination correctly stripped");

  // 3. Hallucination test without evidence
  const facts3 = [{ name: "AWS", evidence: [{ supportingText: "Deployed on AWS" }] }];
  assert(verifyEvidence(facts3, atsResume).length === 0, "Non-existent text evidence correctly stripped");

  // 4. Large resume hash test
  const largeResume = "A".repeat(80000); // 80k characters
  const largeHash = crypto.createHash('sha256').update(largeResume).digest('hex');
  const largeHash2 = crypto.createHash('sha256').update(largeResume).digest('hex');
  assert(largeHash === largeHash2, "Large resume hashing is deterministic");

  // 5. Ambiguous dates (year only) - mock verifying the LLM shouldn't make up exact dates
  // Since we don't have LLM here, we test that if LLM returns "2024" as evidence for "Jan 2024", it fails string match.
  const dateResume = "Software Engineer 2024";
  const facts5 = [{ name: "Experience", evidence: [{ supportingText: "Software Engineer January 2024" }] }];
  // Wait, experience isn't filtered completely if it loses evidence, but skill is. Let's adapt verifyEvidence to filter any fact without evidence.
  // Actually verifyEvidence as written keeps experience if it doesn't have a 'name' field, it only strictly drops if `fact.name && empty evidence`.
  // Let's test that the evidence array becomes empty.
  const ver5 = verifyEvidence(facts5, dateResume);
  assert(ver5.length === 0 || (ver5[0] && ver5[0].evidence && ver5[0].evidence.length === 0), "Fabricated exact date evidence correctly stripped");

  // 6. Two-column style extracted text (often lacks spaces or has weird line breaks)
  const colResume = "React\nNode.js\nCSS\nSoftware Developer";
  const facts6 = [{ name: "React", evidence: [{ supportingText: "React\nNode.js" }] }];
  assert(verifyEvidence(facts6, colResume).length === 1, "Multi-column whitespace variance is handled");

  // 7. Table-like extracted text
  const tableResume = "Skill    Years\nJava     5\nC++      3";
  const facts7 = [{ name: "Java", evidence: [{ supportingText: "Java     5" }] }];
  assert(verifyEvidence(facts7, tableResume).length === 1, "Table whitespace variance is handled");

  // 8. Garbage text
  const garbageResume = "??? *** ;;; \n\n";
  const facts8 = [{ name: "Java", evidence: [{ supportingText: "Java" }] }];
  assert(verifyEvidence(facts8, garbageResume).length === 0, "Garbage resume strips all hallucinatory skills");

  // 9. Short resume
  const shortResume = "Hi I am a dev";
  const facts9 = [{ name: "Developer", evidence: [{ supportingText: "am a dev" }] }];
  assert(verifyEvidence(facts9, shortResume).length === 1, "Short resume retains exact match evidence");

  console.log(`\nResults: ${passed}/${total} passed.`);
}

runTests();
