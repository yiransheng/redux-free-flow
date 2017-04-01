export function shuffleInPlace(array) {
  if (array.length <= 1) {
    return array;
  }

  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    Object.assign(array, {
      [currentIndex]: array[randomIndex],
      [randomIndex]: array[currentIndex]
    });
  }

  return array;
}

export const loopAsync = () => {
  let funcs = [];
  const loop = run => {
    if (run === 0) {
      return Promise.resolve();
    }

    // randomize callback running order
    shuffleInPlace(funcs);
    funcs.forEach(f => f());

    return Promise.resolve(run - 1).then(loop);
  };

  return {
    eachTick(fn) {
      funcs.push(fn);
      return this;
    },
    run(times) {
      this.eachTick = function(){};
      return loop(times);
    }
  };
};

export function defer() {
  let resolve;
  const promise = new Promise(res => {
    resolve = res;
  });
  return {
    resolve,
    promise
  };
}
