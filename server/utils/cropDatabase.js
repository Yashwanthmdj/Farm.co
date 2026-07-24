const cropDatabase = {
  wheat: {
    name: 'Wheat',
    plantingTime: {
      spring: 'March-April',
      fall: 'September-October',
      description: 'Plant in early spring or fall depending on variety'
    },
    fertilizerSchedule: [
      { stage: 'Pre-planting', timing: '2-3 weeks before planting', type: 'NPK 10-26-26', amount: '250-300 kg/ha' },
      { stage: 'Top dressing', timing: '30-35 days after planting', type: 'Urea', amount: '100-120 kg/ha' },
      { stage: 'Second top dressing', timing: '60-65 days after planting', type: 'Urea', amount: '50-60 kg/ha' }
    ],
    wateringSchedule: [
      { stage: 'Germination', frequency: 'Every 3-4 days', amount: 'Light irrigation' },
      { stage: 'Tillering', frequency: 'Every 5-7 days', amount: 'Moderate irrigation' },
      { stage: 'Flowering', frequency: 'Every 4-5 days', amount: 'Heavy irrigation' },
      { stage: 'Grain filling', frequency: 'Every 6-7 days', amount: 'Moderate irrigation' }
    ],
    growthDuration: '120-150 days'
  },
  rice: {
    name: 'Rice',
    plantingTime: {
      kharif: 'June-July',
      rabi: 'November-December',
      description: 'Plant during monsoon season or winter depending on variety'
    },
    fertilizerSchedule: [
      { stage: 'Basal application', timing: 'At transplanting', type: 'NPK 12-32-16', amount: '400-500 kg/ha' },
      { stage: 'First top dressing', timing: '20-25 days after transplanting', type: 'Urea', amount: '150-200 kg/ha' },
      { stage: 'Second top dressing', timing: '40-45 days after transplanting', type: 'Urea', amount: '100-150 kg/ha' }
    ],
    wateringSchedule: [
      { stage: 'Nursery', frequency: 'Daily', amount: 'Keep soil saturated' },
      { stage: 'Transplanting', frequency: 'Daily for first week', amount: '2-3 cm water level' },
      { stage: 'Vegetative', frequency: 'Every 2-3 days', amount: '3-5 cm water level' },
      { stage: 'Flowering', frequency: 'Daily', amount: '5-7 cm water level' },
      { stage: 'Grain filling', frequency: 'Every 3-4 days', amount: '2-3 cm water level' }
    ],
    growthDuration: '100-120 days'
  },
  corn: {
    name: 'Corn (Maize)',
    plantingTime: {
      spring: 'April-May',
      summer: 'June-July',
      description: 'Plant when soil temperature reaches 10°C'
    },
    fertilizerSchedule: [
      { stage: 'Pre-planting', timing: 'At planting', type: 'NPK 12-32-16', amount: '300-400 kg/ha' },
      { stage: 'Side dressing', timing: '25-30 days after planting', type: 'Urea', amount: '150-200 kg/ha' },
      { stage: 'Second side dressing', timing: '45-50 days after planting', type: 'Urea', amount: '100-150 kg/ha' }
    ],
    wateringSchedule: [
      { stage: 'Germination', frequency: 'Every 3-4 days', amount: 'Light irrigation' },
      { stage: 'Vegetative', frequency: 'Every 5-7 days', amount: 'Moderate irrigation' },
      { stage: 'Tasseling', frequency: 'Every 3-4 days', amount: 'Heavy irrigation' },
      { stage: 'Silking', frequency: 'Every 2-3 days', amount: 'Heavy irrigation' },
      { stage: 'Grain filling', frequency: 'Every 4-5 days', amount: 'Moderate irrigation' }
    ],
    growthDuration: '90-120 days'
  },
  cotton: {
    name: 'Cotton',
    plantingTime: {
      spring: 'March-April',
      description: 'Plant when soil temperature is consistently above 15°C'
    },
    fertilizerSchedule: [
      { stage: 'Basal application', timing: 'At planting', type: 'NPK 12-32-16', amount: '250-300 kg/ha' },
      { stage: 'First top dressing', timing: '30-35 days after planting', type: 'Urea', amount: '100-120 kg/ha' },
      { stage: 'Second top dressing', timing: '60-65 days after planting', type: 'Urea', amount: '80-100 kg/ha' }
    ],
    wateringSchedule: [
      { stage: 'Germination', frequency: 'Every 4-5 days', amount: 'Light irrigation' },
      { stage: 'Vegetative', frequency: 'Every 6-8 days', amount: 'Moderate irrigation' },
      { stage: 'Flowering', frequency: 'Every 4-5 days', amount: 'Heavy irrigation' },
      { stage: 'Boll development', frequency: 'Every 5-6 days', amount: 'Moderate irrigation' }
    ],
    growthDuration: '150-180 days'
  },
  sugarcane: {
    name: 'Sugarcane',
    plantingTime: {
      spring: 'February-March',
      autumn: 'September-October',
      description: 'Plant during spring or autumn depending on region'
    },
    fertilizerSchedule: [
      { stage: 'Basal application', timing: 'At planting', type: 'NPK 12-32-16', amount: '400-500 kg/ha' },
      { stage: 'First top dressing', timing: '30-35 days after planting', type: 'Urea', amount: '150-200 kg/ha' },
      { stage: 'Second top dressing', timing: '60-65 days after planting', type: 'Urea', amount: '100-150 kg/ha' },
      { stage: 'Third top dressing', timing: '90-95 days after planting', type: 'Urea', amount: '100-150 kg/ha' }
    ],
    wateringSchedule: [
      { stage: 'Germination', frequency: 'Every 3-4 days', amount: 'Light irrigation' },
      { stage: 'Tillering', frequency: 'Every 5-7 days', amount: 'Moderate irrigation' },
      { stage: 'Grand growth', frequency: 'Every 4-5 days', amount: 'Heavy irrigation' },
      { stage: 'Maturity', frequency: 'Every 6-8 days', amount: 'Moderate irrigation' }
    ],
    growthDuration: '300-365 days'
  },
  potato: {
    name: 'Potato',
    plantingTime: {
      spring: 'February-March',
      autumn: 'September-October',
      description: 'Plant in early spring or autumn'
    },
    fertilizerSchedule: [
      { stage: 'Basal application', timing: 'At planting', type: 'NPK 12-32-16', amount: '300-400 kg/ha' },
      { stage: 'Top dressing', timing: '30-35 days after planting', type: 'Urea', amount: '100-120 kg/ha' }
    ],
    wateringSchedule: [
      { stage: 'Germination', frequency: 'Every 3-4 days', amount: 'Light irrigation' },
      { stage: 'Vegetative', frequency: 'Every 4-5 days', amount: 'Moderate irrigation' },
      { stage: 'Tuber formation', frequency: 'Every 3-4 days', amount: 'Heavy irrigation' },
      { stage: 'Maturity', frequency: 'Every 5-6 days', amount: 'Light irrigation' }
    ],
    growthDuration: '90-120 days'
  },
  tomato: {
    name: 'Tomato',
    plantingTime: {
      spring: 'March-April',
      summer: 'June-July',
      description: 'Plant in spring or summer depending on variety'
    },
    fertilizerSchedule: [
      { stage: 'Basal application', timing: 'At transplanting', type: 'NPK 12-32-16', amount: '200-250 kg/ha' },
      { stage: 'First top dressing', timing: '20-25 days after transplanting', type: 'Urea', amount: '100-120 kg/ha' },
      { stage: 'Second top dressing', timing: '40-45 days after transplanting', type: 'Urea', amount: '80-100 kg/ha' }
    ],
    wateringSchedule: [
      { stage: 'Transplanting', frequency: 'Daily for first week', amount: 'Light irrigation' },
      { stage: 'Vegetative', frequency: 'Every 3-4 days', amount: 'Moderate irrigation' },
      { stage: 'Flowering', frequency: 'Every 2-3 days', amount: 'Heavy irrigation' },
      { stage: 'Fruiting', frequency: 'Every 2-3 days', amount: 'Heavy irrigation' }
    ],
    growthDuration: '70-90 days'
  }
};

module.exports = cropDatabase; 