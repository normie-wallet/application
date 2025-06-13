import { Accelerometer } from 'expo-sensors';

interface AccelerationData {
  x: number;
  y: number;
  z: number;
}

interface ShakeConfig {
  threshold: number;      // Порог силы встряхивания
  windowSize: number;     // Размер окна для определения встряхивания (мс)
  minShakes: number;      // Минимальное количество встряхиваний для срабатывания
  cooldownTime: number;   // Время ожидания после срабатывания (мс)
}

const defaultConfig: ShakeConfig = {
  threshold: 0.5,        // Порог силы встряхивания
  windowSize: 400,       // Окно в 400мс для определения встряхивания
  minShakes: 2,          // Минимум 2 встряхивания для срабатывания
  cooldownTime: 1000,    // 1 секунда кулдауна
};

export class ShakeToAction {
  private lastAcceleration: AccelerationData = { x: 0, y: 0, z: 0 };
  private isProcessing: boolean = false;
  private subscription: any = null;
  private config: ShakeConfig;
  private onShake: () => void;
  private shakeHistory: { time: number; force: number }[] = [];
  private lastShakeTime: number = 0;

  constructor(onShake: () => void, config: Partial<ShakeConfig> = {}) {
    this.onShake = onShake;
    this.config = { ...defaultConfig, ...config };
  }

  public start(): void {
    this.subscription = Accelerometer.addListener(this.handleAccelerometerData);
  }

  public stop(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  private calculateForce(accelerometerData: AccelerationData): number {
    return Math.sqrt(
      Math.pow(accelerometerData.x, 2) +
      Math.pow(accelerometerData.y, 2) +
      Math.pow(accelerometerData.z, 2)
    );
  }

  private isSignificantShake(force: number, delta: number): boolean {
    return force > this.config.threshold && delta > this.config.threshold * 0.5;
  }

  private handleAccelerometerData = (accelerometerData: AccelerationData): void => {
    const currentTime = Date.now();
    const currentForce = this.calculateForce(accelerometerData);
    
    // Вычисляем изменение ускорения по каждой оси
    const deltaX = Math.abs(accelerometerData.x - this.lastAcceleration.x);
    const deltaY = Math.abs(accelerometerData.y - this.lastAcceleration.y);
    const deltaZ = Math.abs(accelerometerData.z - this.lastAcceleration.z);
    
    // Находим максимальное изменение
    const maxDelta = Math.max(deltaX, deltaY, deltaZ);
    
    // Добавляем текущую силу в историю
    this.shakeHistory.push({ time: currentTime, force: currentForce });
    
    // Удаляем старые записи из истории
    this.shakeHistory = this.shakeHistory.filter(
      entry => currentTime - entry.time < this.config.windowSize
    );

    // Находим максимальную силу в текущем окне
    const maxForceInWindow = Math.max(...this.shakeHistory.map(entry => entry.force));
    
    // console.log('Max delta:', maxDelta, 'Force:', currentForce, 'Max force in window:', maxForceInWindow);

    // Определяем встряхивание
    if (this.isSignificantShake(maxForceInWindow, maxDelta) && !this.isProcessing) {
      const timeSinceLastShake = currentTime - this.lastShakeTime;
      
      // Если это второе встряхивание в пределах заданного интервала
      if (timeSinceLastShake < this.config.windowSize && 
          timeSinceLastShake > 100) { // Минимальный интервал между встряхиваниями
        
        // Проверяем количество значимых встряхиваний в окне
        const significantShakes = this.shakeHistory.filter(
          entry => entry.force > this.config.threshold
        ).length;

        if (significantShakes >= this.config.minShakes) {
          this.onShake();
          console.log('Shake detected!');
          this.isProcessing = true;
          setTimeout(() => {
            this.isProcessing = false;
          }, this.config.cooldownTime);
        }
      }
      
      this.lastShakeTime = currentTime;
    }
    
    this.lastAcceleration = { ...accelerometerData };
  };
} 