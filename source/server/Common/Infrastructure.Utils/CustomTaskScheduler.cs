using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using System.Collections.Concurrent;
using System.Diagnostics;

namespace Infrastructure.Utils
{
    /// <summary>
    /// TaskScheduler that uses the task parallel library, complete with all the new wonderful task cancellation features
    /// This one adds the ability to set ApartmentState, ThreadPriority, MaximumConcurrency and does some logging
    /// </summary>
    public class CustomTaskScheduler : TaskScheduler, IDisposable
    {
        private ApartmentState apartmentState;
        private ThreadPriority threadPriority;
        private bool isBackground;

        private readonly List<Thread> threads;

        private BlockingCollection<Task> tasks;

        /// <summary>
        /// An MTA, BelowNormal TaskScheduler with the appropriate number of threads
        /// </summary>
        public CustomTaskScheduler(int numberOfThreads)
            : this(numberOfThreads, ApartmentState.MTA, ThreadPriority.BelowNormal)
        {
        }

        public CustomTaskScheduler(int numberOfThreads, ApartmentState apartmentState = ApartmentState.MTA, ThreadPriority threadPriority = ThreadPriority.Normal, bool isBackground = true)
        {
            this.apartmentState = apartmentState;
            this.threadPriority = threadPriority;
            this.isBackground = isBackground;

            if (numberOfThreads < 1) throw new ArgumentOutOfRangeException("numberOfThreads");

            tasks = new BlockingCollection<Task>();

            threads = Enumerable.Range(0, numberOfThreads).Select(i =>
            {
                var thread = new Thread(() =>
                {
                    foreach (var task in tasks.GetConsumingEnumerable())
                    {
                        ExecuteTaskWithTiming(task, "queued");
                    }
                });
                thread.IsBackground = isBackground;
                thread.Priority = this.threadPriority;
                thread.SetApartmentState(this.apartmentState);
                return thread;
            }).ToList();

            threads.ForEach(t => t.Start());
        }

        protected override void QueueTask(Task task)
        {
            tasks.Add(task);
        }

        protected override IEnumerable<Task> GetScheduledTasks()
        {
            return tasks.ToArray();
        }

        protected override bool TryExecuteTaskInline(Task task, bool taskWasPreviouslyQueued)
        {
            // this is used to execute the Task on the thread that is waiting for it - i.e. INLINE
            // it needs to check the Apartment state and any other requirements
            if (Thread.CurrentThread.GetApartmentState() != this.apartmentState) return false;          // can't execute on wrong Appt state
            if (Thread.CurrentThread.Priority != this.threadPriority) return false;                     // can't execute on wrong priority of thread either
            return ExecuteTaskWithTiming(task, "inline");
        }

        private bool ExecuteTaskWithTiming(Task task, string contextInfo)
        {
            Stopwatch sw = Stopwatch.StartNew();
            //Debug.WriteLine("Starting " + contextInfo + " task");
            bool ok = TryExecuteTask(task);
            //Debug.WriteLine("Ending " + contextInfo + " task, took " + sw.ElapsedMilliseconds + "ms");
            return ok;
        }

        protected override bool TryDequeue(Task task)
        {
            return base.TryDequeue(task);
        }


        public override int MaximumConcurrencyLevel
        {
            get { return threads.Count; }
        }

        public void Dispose()
        {
            if (tasks != null)
            {
                tasks.CompleteAdding();

                foreach (var thread in threads) thread.Join();

                tasks.Dispose();
                tasks = null;
            }
        }
    }
}